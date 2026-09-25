import "./App.css";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "500px",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1>Automotive AI Assistant</h1>

        <p>Hello! How can I help you with your vehicle today?</p>
      </div>
    </div>
  );
}

export default App;
