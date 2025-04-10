// Analyze the nutrient content of a recipe.

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.string().describe('The quantity of the ingredient (e.g., 100g, 2 cups).'),
});

const AnalyzeNutrientContentInputSchema = z.object({
  ingredients: z.array(IngredientSchema).describe('A list of ingredients in the recipe.'),
  recipeName: z.string().describe('The name of the recipe.'),
});

export type AnalyzeNutrientContentInput = z.infer<
  typeof AnalyzeNutrientContentInputSchema
>;

const NutrientInfoSchema = z.object({
  name: z.string().describe('The name of the nutrient.'),
  amount: z.string().describe('The amount of the nutrient (e.g., 10g, 5mg).'),
  unit: z.string().describe('The unit of measurement for the nutrient (e.g., g, mg, mcg).'),
});

const IngredientNutrientAnalysisSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  macronutrients: z.array(NutrientInfoSchema).describe('The macronutrient content of the ingredient.'),
  micronutrients: z.array(NutrientInfoSchema).describe('The micronutrient content of the ingredient.'),
});

const RecipeNutrientAnalysisSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  totalCalories: z.number().describe('The total number of calories in the recipe.'),
  macronutrients: z.array(NutrientInfoSchema).describe('The total macronutrient content of the recipe.'),
  micronutrients: z.array(NutrientInfoSchema).describe('The total micronutrient content of the recipe.'),
  healthinessAssessment: z
    .string()
    .describe('An AI assessment of the recipe’s healthiness, including any potential concerns.'),
});

const AnalyzeNutrientContentOutputSchema = z.object({
  ingredientAnalyses: z
    .array(IngredientNutrientAnalysisSchema)
    .describe('A list of nutrient analyses for each ingredient.'),
  recipeAnalysis: RecipeNutrientAnalysisSchema.describe('The nutrient analysis for the entire recipe.'),
});

export type AnalyzeNutrientContentOutput = z.infer<
  typeof AnalyzeNutrientContentOutputSchema
>;

export async function analyzeNutrientContent(
  input: AnalyzeNutrientContentInput
): Promise<AnalyzeNutrientContentOutput> {
  return analyzeNutrientContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeNutrientContentPrompt',
  input: {
    schema: AnalyzeNutrientContentInputSchema,
  },
  output: {
    schema: AnalyzeNutrientContentOutputSchema,
  },
  prompt: `Analyze the nutrient content of the following recipe:

Recipe Name: {{{recipeName}}}

Ingredients:
{{#each ingredients}}
- Name: {{{name}}}, Quantity: {{{quantity}}}
{{/each}}

Analyze the macronutrient and micronutrient content of each ingredient, as well as the final recipe.

Also, provide an AI assessment of the recipe's healthiness, including the total calorie count.

Format the ingredient analyses like this:

Ingredient Name:
Macronutrients:
- Name: [Nutrient Name], Amount: [Amount], Unit: [Unit]
Micronutrients:
- Name: [Nutrient Name], Amount: [Amount], Unit: [Unit]

Format the recipe analysis like this:

Recipe Name: [Recipe Name]
Total Calories: [Total Calories]
Macronutrients:
- Name: [Nutrient Name], Amount: [Amount], Unit: [Unit]
Micronutrients:
- Name: [Nutrient Name], Amount: [Amount], Unit: [Unit]
Healthiness Assessment: [AI assessment of the recipe's healthiness]`,
});

const analyzeNutrientContentFlow = ai.defineFlow<
  typeof AnalyzeNutrientContentInputSchema,
  typeof AnalyzeNutrientContentOutputSchema
>({
  name: 'analyzeNutrientContentFlow',
  inputSchema: AnalyzeNutrientContentInputSchema,
  outputSchema: AnalyzeNutrientContentOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

