"use client";
import "../../src/init";

import React, { useState } from "react";
import {
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import PropTypes from "prop-types";

const InputTextForTranslation = ({
    currentContact,
    contactId,
    currentLanguage,
    }) => {
        const [inputText, setInputText] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);
        const [debugInfo, setDebugInfo] = useState("");

        // ----- Enter the REST API endpoint for the translation service here -----
        const apiUrl = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

        const handleTranslate = async () => {
            if (!inputText.trim()) return;
            if (!contactId) {
            setError("No active contact");
            return;
            }

            setIsLoading(true);
            setError(null);
            setDebugInfo("Status: Starting translation");

            try {
            // First put the contact on hold
            if (currentContact) {
                setDebugInfo("Status: Call on hold");
                await currentContact.getInitialConnection().hold();
                setDebugInfo("Status: Call on hold");
            }

            // Construct API parameters
            const params = new URLSearchParams({
                txt: inputText,
                sourceLanguageCode: "en-US",
                targetLanguageCode: currentLanguage,
                contactId: contactId,
            });

            const url = `${apiUrl}hello?${params}`;
            setDebugInfo("Status: Processing translation");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                },
                mode: "cors",
            });

            if (!response.ok) {
                throw new Error(
                `API request failed with status ${response.status}`
                );
            }

            setDebugInfo("Status: Translation completed");
            const duration = await response.text();
            const durationMs = parseInt(duration) + 3000;

            setDebugInfo("Status: Delivering message");
            await new Promise((resolve) => setTimeout(resolve, durationMs));

            if (currentContact) {
                setDebugInfo("Status: Resuming call");
                await currentContact.getInitialConnection().resume();
                setDebugInfo("Status: Call resumed");
            }

            setInputText("");
            setDebugInfo("Status: Process completed");
            } catch (err) {
            console.error("Translation error:", err);
            setError(`Translation failed: ${err.message}`);
            setDebugInfo("Status: Translation failed");

            if (currentContact) {
                try {
                setDebugInfo("Status: Attempting to resume call");
                await currentContact.getInitialConnection().resume();
                setDebugInfo("Status: Call resumed");
                } catch (resumeErr) {
                console.error("Error resuming call:", resumeErr);
                setDebugInfo("Status: Failed to resume call");
                }
            }
            } finally {
            setIsLoading(false);
            }
        };

        return (
            <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                Input Text for Translation
            </Typography>
            <TextField
                label="Enter your response text here..."
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                sx={{ width: "800px" }}
                multiline
                rows={8}
                disabled={isLoading}
                error={!!error}
                helperText={error}
                InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                    <MicIcon
                        style={{
                        color: "#002b5b",
                        backgroundColor: "#d7ecf7",
                        borderRadius: "50%",
                        padding: "5px",
                        width: "15px",
                        height: "15px",
                        marginBottom: "-160px",
                        }}
                    />
                    </InputAdornment>
                ),
                }}
            />
            <Button
                variant="contained"
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                sx={{
                marginTop: 2,
                backgroundColor: "#002b5b",
                color: "white",
                borderRadius: "50px",
                fontWeight: "bold",
                textTransform: "none",
                minWidth: "120px",
                }}
            >
                {isLoading ? (
                <CircularProgress size={24} color="inherit" />
                ) : (
                "Translate"
                )}
            </Button>

            {/* Debug information display */}
            {debugInfo && (
                <Typography
                variant="caption"
                sx={{
                    display: "block",
                    mt: 2,
                    color: "text.secondary",
                    whiteSpace: "pre-wrap",
                }}
                >
                {debugInfo}
                </Typography>
            )}
            </Box>
        );
    };

InputTextForTranslation.propTypes = {
    currentContact: PropTypes.shape({
        getInitialConnection: PropTypes.func.isRequired,
    }),
    contactId: PropTypes.string,
    currentLanguage: PropTypes.string,
};

// Add default props
InputTextForTranslation.defaultProps = {
    currentContact: null,
    contactId: "",
    currentLanguage: "en-US",
};

InputTextForTranslation.propTypes = {
    currentContact: PropTypes.shape({
        getInitialConnection: PropTypes.func.isRequired,
    }),
    contactId: PropTypes.string,
    currentLanguage: PropTypes.string,
};

// Add default props
InputTextForTranslation.defaultProps = {
    currentContact: null,
    contactId: "",
    currentLanguage: "en-US",
};

export default InputTextForTranslation;