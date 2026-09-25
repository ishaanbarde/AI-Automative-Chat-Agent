import { Type } from '@google/genai';

/**
 * Function declarations passed to Gemini's `tools` config. Gemini decides
 * when to call these based on the conversation; ToolExecutorService maps
 * the returned name/args to the actual ZohoCrmService methods.
 */
export const zohoToolDeclarations: any = [
  {
    name: 'create_lead',
    description:
      'Create a new Lead in Zoho CRM for a first-time visitor asking about a vehicle. ' +
      "Only call this after you've collected their name, phone, and the vehicle model " +
      "they're interested in (email and city are nice to have but not required).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        First_Name: { type: Type.STRING },
        Last_Name: {
          type: Type.STRING,
          description: 'Required by Zoho even if only a first name was given',
        },
        Phone: { type: Type.STRING },
        Email: { type: Type.STRING },
        City: {
          type: Type.STRING,
          description: 'Preferred city for test drive / delivery',
        },
        Vehicle_Model: {
          type: Type.STRING,
          description: 'e.g. XUV700, Thar, Scorpio-N',
        },
      },
      required: ['Last_Name', 'Phone'],
    },
  },
  {
    name: 'find_deal_by_identifier',
    description:
      "Look up an existing prospect's deal using a phone number or deal ID, to check " +
      'test drive confirmation, quotation status, or dealer contact info.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        identifier: {
          type: Type.STRING,
          description: 'Phone number or Deal ID/Name the customer gave you',
        },
      },
      required: ['identifier'],
    },
  },
  {
    name: 'find_booking_status',
    description:
      'Look up delivery/VIN allocation status for a customer who has already paid a ' +
      'booking amount. Provide bookingId if given, otherwise phone.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        bookingId: { type: Type.STRING },
        phone: { type: Type.STRING },
      },
    },
  },
  {
    name: 'create_service_case',
    description:
      'Log a post-purchase service/maintenance ticket for an existing owner. Only call ' +
      'this after collecting registration number, odometer reading, and the issue or ' +
      'service type requested.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        Subject: {
          type: Type.STRING,
          description: 'Short summary, e.g. "Periodic maintenance - 10000km"',
        },
        Registration_Number: { type: Type.STRING },
        Odometer_Reading: { type: Type.NUMBER },
        Issue_Type: { type: Type.STRING },
        Preferred_Service_Center: { type: Type.STRING },
        Contact_Id: {
          type: Type.STRING,
          description: 'Zoho Contact ID, if already known from a prior lookup',
        },
      },
      required: ['Subject', 'Registration_Number'],
    },
  },
];
