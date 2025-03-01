import "./init";
import React, { useState, useEffect} from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import {
  Box,
} from "@mui/material";

// importing components
import Header from "../components/header/Header";
import RealTimeTranslation from "../components/realTimeTranslation/RealTimeTranslation";
import InputTextForTranslation from "../components/inputTextForTranslation/InputTextForTranslation";
import QuickResponses from "../components/quickResponses/QuickResponses";
import CCPPhonePanel from "../components/ccpPhonePanel/ccpPhonePanel";
import CustomerTranscriptEntityDetect from "../components/customerTranscriptEntityDetect/CustomerTranscriptEntityDetect";

// importing utils functions
import { getSignedUrl, getWebSocket } from "./aws-utils";

// AWS Connect configuration
const region = import.meta.env.VITE_AWS_REGION;

// Define the custom theme
const theme = createTheme({
  typography: {
    fontFamily: "'Noto Sans Oriya', sans-serif",
  },
});

const App = () => {

  var contId = "";
  var currentContactObject = "";

  const [credentials, setCredentials] = useState(null);

  const [ws, setWs] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [contactId, setContactId] = useState("");
  const [connectionId, setConnectionId] = useState("");

  const [transcriptSegments, setTranscriptSegments] = useState({});
  const [currentSegmentId, setCurrentSegmentId] = useState(null);
  const [customerLanguage, setCustomerLanguage] = useState("en-US");


  const processText = (text, isPartial, segID) => {
    console.log("Processing text:", { text, isPartial, segID });

    setTranscriptSegments((prev) => ({
      ...prev,
      [segID]: text,
    }));

    setCurrentSegmentId(segID);

    if (isPartial === "false") {
      // Segment is complete, prepare for next segment
      setCurrentSegmentId(null);
    }
  };

  // Initialize WebSocket
  const initializeWebSocket = async (wsHost, credentials) => {
    if ("WebSocket" in window) {
      try {
        console.log("WebSocket is supported by your Browser!");
        const url = new URL(wsHost);
        const sigv4 = await getSignedUrl(
          url.hostname,
          url.pathname,
          region,
          credentials
        );
        const newWs = new WebSocket(sigv4);

        newWs.onopen = (evt) => {
          console.log("Connection opened:", evt);
          // Initial handshake message
          const message = {
            action: "newcall",
            data: "connId@1234|contactId@1234",
          };
          console.log("Sending initial handshake message:", message);
          newWs.send(JSON.stringify(message));
        };

        newWs.onmessage = (evt) => {
          console.log("Raw message received:", evt.data);

          try {
            // First check if the message contains "connectionId" which indicates it's a JSON message
            if (evt.data.includes("connectionId")) {
              const data = JSON.parse(evt.data);
              console.log("Received connection data:", data);

              if (data.connectionId) {
                console.log("Setting connectionId:", data.connectionId);
                setConnectionId(data.connectionId);

                // If we have both IDs, send the connect message
                if (contId) {
                  const connectMessage = {
                    action: "sendmessage",
                    data: `conndId@${data.connectionId}|contactId@${contId}`,
                  };
                  console.log("Sending connect message:", connectMessage);
                  newWs.send(JSON.stringify(connectMessage));
                }
              }
            } else {
              // Handle text message format: "text@isPartial@segmentId"
              const messageParts = evt.data.split("@");

              if (messageParts.length >= 3) {
                const [text, isPartial, segmentId] = messageParts;
                console.log("Processing transcript parts:", {
                  text,
                  isPartial,
                  segmentId,
                });

                processText(text, isPartial, segmentId);
              } else {
                console.warn(
                  "Received message in unexpected format:",
                  evt.data
                );
              }
            }
          } catch (err) {
            console.error("Error processing message:", err);
            // Log the actual message that caused the error
            console.error("Problem message:", evt.data);
          }
        };

        setWs(newWs);
        return newWs;
      } catch (error) {
        console.error("Error initializing WebSocket:", error);
        throw error;
      }
    }
  };

  // Then, handle the contact updates
  const handleContactUpdate = async (contact, attributes) => {
    console.log("Contact updated:", contact);
    currentContactObject = contact;
    console.log("Current Contact Object: ", currentContactObject);
    console.log("-----Entered handleContactUpdate function----- \n");

    // Store the contact ID
    if (contact?.contactId) {
      setCurrentContact(contact);
      setContactId(contact.contactId);
      contId = contact.contactId;
      console.log("Contact ID -handleContact Update received ---->> : \n", contact.contactId);
      console.log("Contact ID received 2 ---->> :\n", contId);

      // If we already have a connection and haven't sent the message yet, send it now
      if (connectionId && ws) {
        const connectMessage = {
          action: "sendmessage",
          data: `conndId@${connectionId}|contactId@${contId}`,
        };
        console.log(
          "Contact ID received, sending connect message:",
          connectMessage
        );
        ws.send(JSON.stringify(connectMessage));
      }
    }

    if (attributes?.languageCode?.value) {
      console.log(
        "Detected language from Connect:",
        attributes.languageCode.value
      );
      setCustomerLanguage(attributes.languageCode.value);
    }

    // Initialize WebSocket if needed
    if (contact?.contactId && attributes?.aid?.value && !ws) {
      const credentials = {
        accessKeyId: attributes.aid.value,
        secretAccessKey: attributes.sak.value,
        sessionToken: attributes.sst.value,
      };

      setCredentials(credentials);

      await initializeWebSocket(getWebSocket(), credentials);
    }
  };

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <Header
          transcriptSegments={transcriptSegments}
          credentials={credentials}
          customerLanguage={customerLanguage}
        />
        <Grid container spacing={3} sx={{ position: "relative" }}>
          <Grid item xs={3}>
            <CCPPhonePanel onContactUpdate={handleContactUpdate} />
          </Grid>
          <Grid item xs={6} sx={{ position: "relative", zIndex: 2 }}>
            <CustomerTranscriptEntityDetect
              transcriptSegments={transcriptSegments}
              credentials={credentials}
              customerLanguage={customerLanguage}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <InputTextForTranslation
                currentContact={currentContact}
                contactId={contactId}
                currentLanguage={customerLanguage}
              />
            </Box>
          </Grid>
          <Grid item xs={3}>
            <RealTimeTranslation
              transcriptSegments={transcriptSegments}
              credentials={credentials}
              customerLanguage={customerLanguage}
            />
            <QuickResponses />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

export default App;
