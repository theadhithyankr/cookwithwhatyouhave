'use server';
/**
 * @fileOverview Generates a recipe based on a list of ingredients, considering allergies, providing step-wise instructions.
 *
 * - generateRecipe - A function that generates a recipe based on the input ingredients and allergies.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients available in the fridge.'),
  allergies: z.string().optional().describe('A comma-separated list of allergies to avoid in the recipe.'),
  strictMode: z.boolean().optional().describe('Whether to only use provided ingredients.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const RecipeStepSchema = z.object({
  step: z.string().describe('A single step in the recipe instructions.'),
  timer: z.string().optional().describe('The time required for this step, if any (e.g., "5 minutes").'),
});

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
  instructions: z.array(RecipeStepSchema).describe('The cooking instructions for the recipe, step by step.'),
  allergyWarning: z.string().optional().describe('A warning if the generated recipe may contain allergens.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {
    schema: z.object({
      ingredients: z.string().describe('A comma-separated list of ingredients available in the fridge.'),
      allergies: z.string().optional().describe('A comma-separated list of allergies to avoid in the recipe.'),
      strictMode: z.boolean().optional().describe('Whether to only use provided ingredients.'),
    }),
  },
  output: {
    schema: z.object({
      recipeName: z.string().describe('The name of the generated recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.array(RecipeStepSchema).describe('The cooking instructions for the recipe, step by step, with optional timers.'),
      allergyWarning: z.string().optional().describe('A warning if the generated recipe may contain allergens.'),
    }),
  },
  prompt: `You are a world-class chef. Generate a recipe based on the ingredients provided, taking into account any specified allergies.

Ingredients: {{{ingredients}}}
Allergies (if any): {{{allergies}}}
StrictMode: {{{strictMode}}}

Instructions should be provided step by step. If a step requires a timer, include the time.

${
    `
If strictMode is true, only use the provided ingredients.
`
  }

Recipe Name:
Ingredients:
Instructions:
[
  {
    "step": "Preheat oven to 375 degrees F (190 degrees C).",
    "timer": null
  },
  {
    "step": "In a large bowl, cream together the butter, brown sugar, and white sugar.",
    "timer": null
  },
  {
    "step": "Bake for 10-12 minutes, or until edges are nicely browned.",
    "timer": "10-12 minutes"
  }
]
Allergy Warning (if any):`,
});

const generateRecipeFlow = ai.defineFlow<
  typeof GenerateRecipeInputSchema,
  typeof GenerateRecipeOutputSchema
>({
  name: 'generateRecipeFlow',
  inputSchema: GenerateRecipeInputSchema,
  outputSchema: GenerateRecipeOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
