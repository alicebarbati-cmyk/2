import { GoogleGenAI, Type } from "@google/genai";
import type { Flashcard, QuizQuestion, RoutineSlot, LessonPlan, InterdisciplinaryConnection } from '../types';

// Funzione di utilità per ottenere l'istanza AI con controllo sulla chiave
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
                            question: {
                                type: Type.STRING,
                                description: "The question for the front of the flashcard."
                            },
                            answer: {
                                type: Type.STRING,
                                description: "The answer for the back of the flashcard."
                            }
                        },
                        required: ["question", "answer"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
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
        'mixed': 'un mix di domande a risposta multipla (con 4 opzioni) e domande a risposta aperta'
    }[questionType as 'multiple' | 'open' | 'mixed'];

    const difficultyIta = {
        'easy': 'facile',
        'medium': 'medio',
        'hard': 'difficile'
    }[difficulty as 'easy' | 'medium' | 'hard'];

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Genera un quiz di ${numQuestions} domande in italiano per uno studente di scuola superiore sull'argomento: "${topic}". Il livello di difficoltà deve essere ${difficultyIta}. Il quiz deve contenere ${typeInstruction}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING, description: "Can be 'multiple' or 'open'."},
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                description: "Array of 4 options for multiple choice questions."
                            },
                            correct: { 
                                type: Type.INTEGER,
                                description: "The 0-based index of the correct option for multiple choice questions."
                            },
                            answer: { 
                                type: Type.STRING,
                                description: "A suggested correct answer for open-ended questions."
                            }
                        },
                         required: ["question", "type"]
                    }
                }
            }
        });
        
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

export const generateTestQuestions = async (topic: string, numQuestions: number, questionType: string, difficulty: string): Promise<QuizQuestion[]> => {
     const typeInstruction = {
        'multiple': 'solo domande a risposta multipla con 4 opzioni ciascuna',
        'open': 'solo domande a risposta aperta e definizioni',
        'mixed': 'un mix di domande a risposta multipla (con 4 opzioni), domande a risposta aperta e definizioni'
    }[questionType as 'multiple' | 'open' | 'mixed'];

    const difficultyIta = {
        'easy': 'facile',
        'medium': 'medio',
        'hard': 'difficile'
    }[difficulty as 'easy' | 'medium' | 'hard'];

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Genera una verifica completa di ${numQuestions} domande in italiano per una classe di scuola superiore sull'argomento: "${topic}". Il livello di difficoltà deve essere ${difficultyIta}. La verifica deve contenere ${typeInstruction}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING, description: "Can be 'multiple', 'open', or 'definition'."},
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                description: "Array of 4 options for multiple choice questions."
                            },
                            correct: { 
                                type: Type.INTEGER,
                                description: "The 0-based index of the correct option for multiple choice questions."
                            },
                            answer: { 
                                type: Type.STRING,
                                description: "A suggested correct answer for open-ended or definition questions."
                            }
                        },
                         required: ["question", "type"]
                    }
                }
            }
        });
        
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating test questions:", error);
        throw error;
    }
};

export const generateRoutine = async (startTime: string, endTime: string, tasks: string, commitments: string): Promise<RoutineSlot[]> => {
    try {
        const ai = getAi();
        const prompt = `
            Create a study schedule for a student.
            - Start time: ${startTime}
            - End time: ${endTime}
            - Tasks to complete: ${tasks}
            - Pre-existing commitments: ${commitments || 'None'}
            Plan out the study sessions for the tasks, allocating reasonable time for each. Include short breaks (10-15 minutes) between study blocks.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            start: { type: Type.STRING, description: "Start time in HH:MM format." },
                            end: { type: Type.STRING, description: "End time in HH:MM format." },
                            activity: { type: Type.STRING, description: "Description of the activity." },
                            type: { type: Type.STRING, description: "Type of activity: 'study', 'break', or 'commitment'."}
                        },
                        required: ["start", "end", "activity", "type"]
                    }
                }
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating routine:", error);
        throw error;
    }
}

export const generateLessonPlan = async (topic: string, duration: number, difficulty: string): Promise<LessonPlan> => {
    const difficultyMap = {
        'easy': 'per principianti',
        'medium': 'di livello intermedio',
        'hard': 'per esperti/avanzato'
    };
    const difficultyIta = difficultyMap[difficulty as keyof typeof difficultyMap];

    try {
        const ai = getAi();
        const prompt = `Crea un piano di lezione dettagliato per una classe di scuola superiore sull'argomento: "${topic}". Durata: ${duration} minuti. Difficoltà: ${difficultyIta}.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
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

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw error;
    }
};

export const generateInterdisciplinaryConnections = async (topic: string, subject: string): Promise<InterdisciplinaryConnection[]> => {
    try {
        const ai = getAi();
        const prompt = `Dato l'argomento "${topic}" (materia: "${subject}"), genera 4-5 collegamenti interdisciplinari con materie di un liceo italiano.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
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

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating connections:", error);
        throw error;
    }
};

const REGULATION_TEXT = `L'IISS "Pietro Verri" è una comunità di dialogo, di ricerca, di esperienza sociale, informata ai valori democratici e volta alla crescita della persona in tutte le sue dimensioni. Il regolamento aggiornato al 10/11/2025 prevede il rispetto delle persone, delle strutture e degli orari. L'uso dei telefoni cellulari è consentito solo per finalità didattiche sotto la supervisione del docente.`;

export const answerRegulationQuestion = async (question: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: question,
            config: {
                systemInstruction: `Sei un assistente esperto del regolamento d'istituto dell'IISS "Pietro Verri". Rispondi basandoti ESCLUSIVAMENTE su questo testo:\n\n${REGULATION_TEXT}`
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error answering regulation question:", error);
        throw error;
    }
};