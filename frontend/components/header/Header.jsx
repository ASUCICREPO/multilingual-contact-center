import "../../src/init";
import React from "react";
import PropTypes from 'prop-types';
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { Translate } from "@mui/icons-material";
import SentimentAnalysis from "../sentimentAnalysis/SentimentAnalysis";

const Header = ({ transcriptSegments, credentials, customerLanguage }) => {
        return (
        <Box
            className="header"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ backgroundColor: "#002b5b", padding: "20px", color: "white" }}
        >
            <Typography variant="h5" className="header-title">
            Live Agent Translation for Amazon in Connect
            </Typography>
            <Box className="header-info" display="flex" gap={4} alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
                <Translate style={{ color: "white" }} />
                <Typography variant="body1" className="info-label">
                Language in Use:
                </Typography>
                <Select
                value="Spanish"
                variant="outlined"
                style={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                    height: "36px",
                }}
                >
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="English">English</MenuItem>
                </Select>
            </Box>
            <SentimentAnalysis
                transcriptSegments={transcriptSegments}
                credentials={credentials}
                customerLanguage={customerLanguage}
            />
            </Box>
        </Box>
    );
};

Header.propTypes = {
    transcriptSegments: PropTypes.objectOf(PropTypes.string).isRequired,
    credentials: PropTypes.shape({
        accessKeyId: PropTypes.string,
        secretAccessKey: PropTypes.string,
        sessionToken: PropTypes.string,
    }),
    customerLanguage: PropTypes.string,
};

Header.defaultProps = {
    credentials: null,
    customerLanguage: "en-US",
};

export default Header;
