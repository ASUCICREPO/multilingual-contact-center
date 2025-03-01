import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AWS from "aws-sdk";
import {
    Typography,
    Box,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
} from "@mui/material";

const CustomerTranscriptEntityDetect = ({
    transcriptSegments,
    credentials,
    customerLanguage,
    }) => {
    const [viewMode, setViewMode] = useState("transcription");
    const [processedSegments, setProcessedSegments] = useState({});

    const entityColors = React.useMemo(
        () => ({
        BOOK: "#98DF8A",
        BRAND: "#FF9896",
        COMMERCIAL_ITEM: "#C7C7C7",
        DATE: "#9EDAE5",
        EVENT: "#FFBB78",
        GAME: "#C49C94",
        LOCATION: "#C5B0D5",
        MOVIE: "#DBDB8D",
        ORGANIZATION: "#F7B6D2",
        OTHERS: "#AEC7E8",
        OTHER: "#17BECF",
        PERSON: "#BCBD22",
        QUANTITY: "#7F7F7F",
        SOFTWARE: "#E377C2",
        SONG: "#8C564B",
        TITLE_OTHERS: "#9467BD",
        TITLE: "#D62728",
        }),
        []
    );

    useEffect(() => {
        const detectEntities = async (text, language) => {
        if (!credentials || !text) return text;

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

            const comprehendLanguage = languageMap[language] || "en";
            const params = {
            LanguageCode: comprehendLanguage,
            Text: text,
            };

            const data = await comprehend.detectEntities(params).promise();

            if (!data.Entities) {
            return text;
            }

            let processedText = text;
            const sortedEntities = [...data.Entities].sort((a, b) => {
            return text.lastIndexOf(b.Text) - text.lastIndexOf(a.Text);
            });

            sortedEntities.forEach((entity) => {
            const score = (entity.Score * 100).toFixed(1);
            const tooltipContent = `Type: ${entity.Type} - Confidence: ${score}%`;
            const color = entityColors[entity.Type] || "#AEC7E8";

            const highlightedEntity = `<span 
                            class="entity-highlight" 
                            data-tooltip="${tooltipContent}"
                            style="
                                border-bottom: 3px solid ${color}; 
                                display: inline-block; 
                                cursor: help;
                                position: relative;
                                margin: 0 1px;
                            "
                        >${entity.Text}</span>`;

            processedText = processedText.replace(entity.Text, highlightedEntity);
            });

            return {
            original: text,
            processed: processedText,
            };
        } catch (error) {
            console.error("Error detecting entities:", error);
            return {
            original: text,
            processed: text,
            };
        }
        };

        const processAllSegments = async () => {
        const processed = {};
        for (const [segId, text] of Object.entries(transcriptSegments)) {
            const result = await detectEntities(text, customerLanguage);
            processed[segId] = result;
        }
        setProcessedSegments(processed);
        };

        if (viewMode === "entities") {
        processAllSegments();
        }
    }, [
        transcriptSegments,
        credentials,
        customerLanguage,
        viewMode,
        entityColors,
    ]);

    const getDisplayText = (segId) => {
        if (!processedSegments[segId]) return transcriptSegments[segId];
        return viewMode === "entities"
        ? processedSegments[segId].processed
        : processedSegments[segId].original;
    };

    return (
        <Box sx={{ position: "relative", zIndex: 2 }}>
        <Typography
            variant="h6"
            sx={{
            fontWeight: "bold",
            marginBottom: 1,
            marginTop: "-75px",
            color: "white",
            }}
        >
            Customer Transcript
        </Typography>
        <FormControl>
            <RadioGroup
            row
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            >
            <FormControlLabel
                value="transcription"
                control={<Radio sx={{ color: "white" }} />}
                label={
                <Typography sx={{ color: "white" }}>Transcription</Typography>
                }
            />
            <FormControlLabel
                value="entities"
                control={<Radio sx={{ color: "white" }} />}
                label={<Typography sx={{ color: "white" }}>Entities</Typography>}
            />
            </RadioGroup>
        </FormControl>
        <Box
            sx={{
            minHeight: "130px",
            maxHeight: "200px",
            overflow: "auto",
            padding: "5px",
            color: "#666",
            background: "#f5f5f5",
            border: "1px solid",
            margin: "5px",
            borderRadius: "5px",
            width: "800px",
            marginTop: "20px",
            position: "relative",
            zIndex: 1000,
            }}
        >
            {Object.keys(transcriptSegments).map((segId) => (
            <div
                key={segId}
                className="transcript-row"
                dangerouslySetInnerHTML={{ __html: getDisplayText(segId) }}
            />
            ))}
        </Box>
        </Box>
    );
};

CustomerTranscriptEntityDetect.propTypes = {
    transcriptSegments: PropTypes.objectOf(PropTypes.string).isRequired,
    credentials: PropTypes.shape({
        accessKeyId: PropTypes.string,
        secretAccessKey: PropTypes.string,
        sessionToken: PropTypes.string,
    }),
    customerLanguage: PropTypes.string,
};

CustomerTranscriptEntityDetect.defaultProps = {
    credentials: null,
    customerLanguage: "en-US",
};

export default CustomerTranscriptEntityDetect;
