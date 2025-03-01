"use client";
import "../../src/init";

import React, { useState } from "react";
import { Typography, Box, Pagination } from "@mui/material";

const QuickResponses = () => {
    return (
        <Box className="quick-responses">
        <div className="quick-responses-lower"></div>
        <div className="quick-responses-content">
            <Box
            className="quick-responses-header"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ marginBottom: "10px" }}
            >
            <Typography variant="h6" className="quick-responses-title">
                Quick Responses
            </Typography>
            <Pagination
                count={5}
                size="small"
                sx={{
                "& .MuiPaginationItem-root": { color: "#ffffff" },
                "& .Mui-selected": {
                    backgroundColor: "#ffffff",
                    color: "#002b5b",
                    borderRadius: "50%",
                },
                }}
            />
            </Box>
            <ul className="quick-responses-list">
            {[
                "Please enter your Date of Birth",
                "Please confirm your phone number",
                "Can you please confirm your address",
                "Are there any other issues?",
                "Can you please provide more information on this?",
                "We will follow up on this and get back to you soon",
                "We are currently investigating this issue with high priority",
                "Thank you for contacting us, have a great day!",
            ].map((response, index) => (
                <li key={index}>
                {index + 1}. {response}
                </li>
            ))}
            </ul>
        </div>
        </Box>
    );
};

export default QuickResponses;
