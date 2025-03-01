"use client";
import "../../src/init";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AWS from "aws-sdk";
import { Box, Typography, Select, MenuItem } from "@mui/material";

const LANGUAGE_MAP = {
  "en-US": "en",
  "es-US": "es",
  "ko-KR": "ko",
  "fr-FR": "fr",
  "ja-JP": "ja",
  "zh-CN": "zh",
  "ar-AE": "ar",
};

const LANGUAGE_DISPLAY_NAMES = {
  "en-US": "English",
  "es-US": "Spanish",
  "ko-KR": "Korean",
  "fr-FR": "French",
  "ja-JP": "Japanese",
  "zh-CN": "Chinese",
  "ar-AE": "Arabic",
};

const RealTimeTranslation = ({
  transcriptSegments,
  credentials,
  customerLanguage = "en-US",
}) => {
  const [translations, setTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    if (!credentials || !transcriptSegments) return;

    AWS.config.update({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      }),
    });

    const translate = new AWS.Translate();

    const latestSegmentId = Object.keys(transcriptSegments).pop();
    if (!latestSegmentId) return;

    const textToTranslate = transcriptSegments[latestSegmentId];
    if (!textToTranslate) return;

    const sourceLanguage = LANGUAGE_MAP[customerLanguage] || "en";

    if (sourceLanguage === selectedLanguage) {
      setTranslations((prev) => ({
        ...prev,
        [latestSegmentId]: textToTranslate,
      }));
      return;
    }

    const params = {
      Text: textToTranslate,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: selectedLanguage,
    };

    console.log("Translation params:", params);

    translate.translateText(params, (err, data) => {
      if (err) {
        console.error("Translation error:", err);
        return;
      }

      setTranslations((prev) => ({
        ...prev,
        [latestSegmentId]: data.TranslatedText,
      }));
    });
  }, [transcriptSegments, credentials, customerLanguage, selectedLanguage]);

  // Use the static language display names map
  const getLanguageDisplayName = (code) => {
    return LANGUAGE_DISPLAY_NAMES[code] || code;
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          marginTop: "-45px",
          color: "white",
        }}
      >
        Real-time Translation 
        <Typography
          variant="caption"
          sx={{ display: "block", color: "lightgray" }}
        >
          {/* From: {getLanguageDisplayName(customerLanguage)} */}
        </Typography>
      </Typography>

      <Select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        sx={{ mb: 2, backgroundColor: "white", width: "200px" }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Spanish</MenuItem>
        <MenuItem value="ja">Japanese</MenuItem>
        <MenuItem value="zh">Chinese</MenuItem>
        <MenuItem value="ko">Korean</MenuItem>
        <MenuItem value="ar">Arabic</MenuItem>
        <MenuItem value="fr">French</MenuItem>
      </Select>

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
          width: "300px",
        }}
      >
        {Object.entries(translations).map(([segId, translatedText]) => (
          <React.Fragment key={segId}>
            <span className="translate-row">{translatedText}</span>
            <br />
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

RealTimeTranslation.propTypes = {
  transcriptSegments: PropTypes.objectOf(PropTypes.string),
  credentials: PropTypes.shape({
    accessKeyId: PropTypes.string,
    secretAccessKey: PropTypes.string,
    sessionToken: PropTypes.string,
  }),
  customerLanguage: PropTypes.oneOf([
    "en-US",
    "es-US",
    "ko-KR",
    "fr-FR",
    "ja-JP",
    "zh-CN",
    "ar-AE",
  ]),
};

RealTimeTranslation.defaultProps = {
  transcriptSegments: {},
  credentials: null,
  customerLanguage: "en-US",
};

export default RealTimeTranslation;
