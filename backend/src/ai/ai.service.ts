import { Content, FunctionCall, GoogleGenAI, Part } from '@google/genai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolExecutorService } from '../tools/tool-executor.service';
import { zohoToolDeclarations } from '../tools/zoho-tools.definitions';

export interface ChatResult {
  text: string;
  /** New turns (user, model function-call, tool result, model final) to persist to history */
  newTurns: Content[];
}

@Injectable()
export class AiService implements OnModuleInit {
  private ai: GoogleGenAI;

  private readonly geminiModel = 'gemini-3.5-flash-lite';
  private readonly logger = new Logger(AiService.name);

  /** Safety cap on tool-call round-trips per single user message */
  private readonly maxToolIterations = 5;

  private readonly systemInstruction = `
    You are an automotive sales & service assistant for an OEM dealership network.
    You handle customers across four stages of the purchase and ownership lifecycle:

    1. New Lead — an unidentified visitor asking about vehicle models, pricing, or features.
    Answer their question, then collect Full Name, Phone, Email, and Preferred City, and
    call create_lead with the vehicle model they're interested in.

    2. Ongoing Pipeline — an existing prospect asking about test drive confirmation, a
    quotation, or dealer contact. Call find_deal_by_identifier with their phone or deal ID.

    3. Booked Vehicle — a customer who has already paid a booking amount, asking about
    delivery timeline or VIN allocation. Call find_booking_status with their Booking ID
    or phone number.

    4. Post-Purchase / Service — an existing owner logging a complaint or booking a service
    slot. Collect registration number, odometer reading, and the issue/service type, then
    call create_service_case.

    Always use the tools to fetch or record real data rather than guessing or inventing
    information. Keep a professional OEM brand tone and accurate vehicle jargon.

    If a prompt is ambiguous between a vehicle name and something else (e.g. "Thar",
    "Mustang", "Cayman"), always assume the user means the vehicle. If a prompt has no
    logical connection to vehicles, transportation, or these four workflows, politely
    redirect the user back to automotive topics.
`;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolExecutor: ToolExecutorService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.logger.log('Gemini AI Service initialised successfully!');
  }

  /**
   * Runs one user turn, resolving any tool calls Gemini makes along the way,
   * and returns the final text reply plus every new turn that should be
   * appended to session history.
   */
  async chat(history: Content[], message: string): Promise<ChatResult> {
    const newTurns: Content[] = [{ role: 'user', parts: [{ text: message }] }];
    let contents: Content[] = [...history, ...newTurns];

    for (let i = 0; i < this.maxToolIterations; i++) {
      const response = await this.ai.models.generateContent({
        model: this.geminiModel,
        contents,
        config: {
          systemInstruction: this.systemInstruction,
          tools: [{ functionDeclarations: zohoToolDeclarations }],
        },
      });

      const calls: FunctionCall[] = response.functionCalls ?? [];
      const modelTurn: Content = response.candidates?.[0]?.content ?? {
        role: 'model',
        parts: [{ text: response.text ?? '' }],
      };

      // No tool calls -> Gemini is done, return its text
      if (calls.length === 0) {
        newTurns.push(modelTurn);
        this.logger.log(`Gemini final reply: ${response.text}`);
        return { text: response.text ?? '', newTurns };
      }

      // Record the model's function-call turn, signature intact
      newTurns.push(modelTurn);

      // Execute every requested call and build the function-response turn
      const responseParts: Part[] = [];
      for (const call of calls) {
        const result = await this.toolExecutor.execute(
          call.name!,
          call.args ?? {},
        );
        responseParts.push({
          functionResponse: {
            name: call.name!,
            response: { result },
          },
        });
      }
      const toolResultTurn: Content = { role: 'user', parts: responseParts };
      newTurns.push(toolResultTurn);

      // Feed the call + result back in and loop so Gemini can respond or chain another call
      contents = [...contents, modelTurn, toolResultTurn];
    }

    this.logger.warn(
      'Max tool iterations reached without a final text response',
    );
    const fallback =
      "Sorry, I'm having trouble completing that — could you try rephrasing?";
    return { text: fallback, newTurns };
  }
}
