import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[], context?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chave de API ausente. Configure a variável de ambiente API_KEY para usar a IA.";
  }

  try {
    // Limit data size to save tokens but prioritize recent/relevant ones
    const relevantTransactions = transactions.slice(0, 80).map(t => ({
      title: t.title,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.split('T')[0]
    }));

    const basePrompt = `
      Atue como um analista financeiro pessoal. Analise os dados fornecidos e gere um relatório em Português do Brasil.
      
      Dados das transações:
      ${JSON.stringify(relevantTransactions)}
    `;

    let specificInstruction = "";
    if (context === 'report') {
        specificInstruction = `
        Gere um **Relatório de Período**. 
        1. Resuma o total ganho vs. total gasto.
        2. Identifique a maior categoria de gasto.
        3. Aponte tendências (ex: gastos aumentando no final do período).
        4. Dê uma dica específica para o próximo período.
        Use Markdown. Seja objetivo.
        `;
    } else {
        specificInstruction = `
        Forneça 3 "insights" rápidos e acionáveis sobre hábitos de consumo ou alertas de orçamento. Seja breve e motivador.
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: basePrompt + specificInstruction,
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com a IA. Verifique sua conexão.";
  }
};
