import { GoogleGenAI, Type } from "@google/genai";
import type { Flashcard, QuizQuestion, RoutineSlot, LessonPlan, InterdisciplinaryConnection } from '../types';

declare var process: {
    env: {
        API_KEY: string;
    };
};

const getAi = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
        throw new Error("Chiave API mancante. Configura la variabile d'ambiente API_KEY nelle impostazioni di Vercel.");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 5 flashcards for the topic: "${topic}". Focus on key concepts.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING }
                        },
                        required: ["question", "answer"]
                    }
                }
            }
        });
        const jsonText = response.text || "[]";
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw error;
    }
};

export const generateQuiz = async (topic: string, numQuestions: number, questionType: string, difficulty: string): Promise<QuizQuestion[]> => {
    const typeInstruction = {
        'multiple': 'solo domande a risposta multipla con 4 opzioni ciascuna',
        'open': 'solo domande a risposta aperta',
        'mixed': 'un mix di domande a risposta multipla e aperta'
    }[questionType as 'multiple' | 'open' | 'mixed'];

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Genera un quiz di ${numQuestions} domande in italiano su: "${topic}". Difficoltà: ${difficulty}. Tipo: ${typeInstruction}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correct: { type: Type.INTEGER },
                            answer: { type: Type.STRING }
                        },
                        required: ["question", "type"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

export const generateTestQuestions = async (topic: string, numQuestions: number, questionType: string, difficulty: string): Promise<QuizQuestion[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Genera una verifica di ${numQuestions} domande in italiano su: "${topic}". Difficoltà: ${difficulty}. Tipo: ${questionType}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correct: { type: Type.INTEGER },
                            answer: { type: Type.STRING }
                        },
                        required: ["question", "type"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Error generating test questions:", error);
        throw error;
    }
};

export const generateRoutine = async (startTime: string, endTime: string, tasks: string, commitments: string): Promise<RoutineSlot[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Crea una routine di studio dalle ${startTime} alle ${endTime}. Task: ${tasks}. Impegni: ${commitments}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            start: { type: Type.STRING },
                            end: { type: Type.STRING },
                            activity: { type: Type.STRING },
                            type: { type: Type.STRING }
                        },
                        required: ["start", "end", "activity", "type"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Error generating routine:", error);
        throw error;
    }
};

export const generateLessonPlan = async (topic: string, duration: number, difficulty: string): Promise<LessonPlan> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Crea un piano di lezione su "${topic}". Durata: ${duration} min. Difficoltà: ${difficulty}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING },
                                    duration: { type: Type.INTEGER }
                                },
                                required: ["title", "content", "duration"]
                            }
                        },
                        assessment: { type: Type.STRING }
                    },
                    required: ["title", "objective", "materials", "sections", "assessment"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw error;
    }
};

export const generateInterdisciplinaryConnections = async (topic: string, subject: string): Promise<InterdisciplinaryConnection[]> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Genera collegamenti interdisciplinari per "${topic}" partendo da "${subject}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            connection: { type: Type.STRING }
                        },
                        required: ["subject", "connection"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Error generating connections:", error);
        throw error;
    }
};

const REGULATION_TEXT = `L'IISS "Pietro Verri" è una comunità di dialogo...`;

export const answerRegulationQuestion = async (question: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: question,
            config: {
                systemInstruction: `Rispondi sul regolamento del Verri: ${REGULATION_TEXT}`
            }
        });
        return response.text || "Non ho trovato una risposta nel regolamento.";
    } catch (error) {
        console.error("Error answering regulation question:", error);
        return "Errore nella comunicazione con l'assistente.";
    }
};