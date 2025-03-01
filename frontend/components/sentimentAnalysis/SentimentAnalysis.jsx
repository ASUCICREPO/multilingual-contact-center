import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { SentimentSatisfiedAlt } from "@mui/icons-material";
import AWS from "aws-sdk";

const SentimentAnalysis = ({
    transcriptSegments,
    credentials,
    customerLanguage,
    }) => {
    const [currentSentiment, setCurrentSentiment] = useState({
        emoji: "😐",
        label: "Neutral",
    });

    const getSentiment = React.useCallback(async (text, language) => {
        console.log("Attempting sentiment analysis with:", {
        text,
        language,
        hasCredentials: !!credentials,
        });

        if (!credentials || !text) {
        console.log("Missing credentials or text, skipping sentiment analysis");
        return null;
        }

        try {
        const comprehend = new AWS.Comprehend({
            credentials: new AWS.Credentials({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
            }),
            region: import.meta.env.VITE_AWS_REGION,
        });

        const languageMap = {
            "en-US": "en",
            "es-US": "es",
            "ko-KR": "ko",
            "fr-FR": "fr",
            "ja-JP": "ja",
            "zh-CN": "zh",
            "ar-AE": "ar",
        };

        const params = {
            Text: text,
            LanguageCode: languageMap[language] || "en",
        };

        const result = await comprehend.detectSentiment(params).promise();
        console.log("Raw AWS Comprehend response:", {
            sentiment: result.Sentiment,
            scores: result.SentimentScore,
        });
        return result;
        } catch (error) {
        console.error("Sentiment analysis error:", error);
        return null;
        }
    }, [credentials]);

    const getEmoji = (sentiment, score) => {
        // Log raw values 
        console.log("Determining emoji for:", {
        sentiment,
        score,
        });

        // Direct mapping of AWS Comprehend sentiment to emoji
        if (sentiment === "NEUTRAL") {
        return "😐";
        } else if (sentiment === "POSITIVE" && score.Positive > 0.9885) {
        return "🤩";
        } else if (sentiment === "POSITIVE") {
        return "😊";
        } else if (sentiment === "NEGATIVE") {
        return "😠";
        } else {
        // For MIXED or any unexpected values
        return "😕";
        }
    };

    useEffect(() => {
        const analyzeLatestSegment = async () => {
        console.log("Transcript segments updated:", {
            segmentsCount: Object.keys(transcriptSegments).length,
            lastUpdate: new Date().toISOString(),
        });
        // Get the latest segment
        const segments = Object.values(transcriptSegments);
        if (segments.length === 0) {
            console.log("No segments to analyze");
            return;
        }

        console.log("Analyzing latest segment:", {
            totalSegments: segments.length,
            latestSegment: segments[segments.length - 1],
        });

        const latestSegment = segments[segments.length - 1];

        const result = await getSentiment(latestSegment, customerLanguage);

        if (result) {
            const emoji = getEmoji(result.Sentiment, result.SentimentScore);
            const newSentiment = {
            emoji,
            label:
                result.Sentiment.charAt(0) +
                result.Sentiment.slice(1).toLowerCase(),
            };
            console.log("Updating sentiment display:", newSentiment);
            setCurrentSentiment(newSentiment);
        }
        };

        analyzeLatestSegment();
    }, [transcriptSegments, credentials, customerLanguage, getSentiment]);

    return (
        <Box display="flex" alignItems="center" gap={1}>
        <SentimentSatisfiedAlt style={{ color: "white" }} />
        <Typography variant="body1" className="info-label">
            Overall Customer Sentiment:
        </Typography>
        <Box
            style={{
            backgroundColor: "#d4edda",
            display: "flex",
            alignItems: "center",
            padding: "5px 10px",
            borderRadius: "4px",
            }}
        >
            <Typography
            variant="body1"
            style={{
                color: "#155724",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
            }}
            >
            {currentSentiment.emoji} {currentSentiment.label}
            </Typography>
        </Box>
        </Box>
    );
};

SentimentAnalysis.propTypes = {
    transcriptSegments: PropTypes.objectOf(PropTypes.string).isRequired,
    credentials: PropTypes.shape({
        accessKeyId: PropTypes.string,
        secretAccessKey: PropTypes.string,
        sessionToken: PropTypes.string,
    }),
    customerLanguage: PropTypes.string,
};

SentimentAnalysis.defaultProps = {
    credentials: null,
    customerLanguage: "en-US",
};

export default SentimentAnalysis;
