/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { LabResult, Patient, TestDefinition } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeLabResult(result: LabResult, patient: Patient, panelTests: TestDefinition[]) {
  const model = "gemini-3.1-pro-preview";
  
  const resultData = panelTests.map((test, i) => ({
    test: test.name,
    value: result.values[i] || "N/A",
    unit: test.unit,
    reference: test.ref
  }));

  const prompt = `
    As a clinical laboratory consultant, analyze the following lab result for a patient.
    
    Patient Info:
    - Name: ${patient.firstName} ${patient.lastName}
    - Age: ${new Date().getFullYear() - new Date(patient.dob).getFullYear()}
    - Gender: ${patient.gender}
    - Notes: ${patient.notes || "None"}
    
    Lab Result (${result.panel}):
    ${JSON.stringify(resultData, null, 2)}
    
    Provide a concise clinical summary including:
    1. Key findings (highlighting critical or abnormal values).
    2. Potential clinical correlations.
    3. Suggested follow-up or additional tests if applicable.
    
    Keep the tone professional and informative.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Analysis unavailable at this time.";
  }
}
