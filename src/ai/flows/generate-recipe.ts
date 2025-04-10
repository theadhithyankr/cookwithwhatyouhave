'use server';
/**
 * @fileOverview Generates a recipe based on a list of ingredients, considering allergies, providing step-wise instructions, and alternative recipes.
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
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const RecipeStepSchema = z.object({
  step: z.string().describe('A single step in the recipe instructions.'),
  timer: z.string().optional().describe('The time required for this step, if any (e.g., "5 minutes").'),
});

const AlternateRecipeSchema = z.object({
  name: z.string().describe('The name of the alternate recipe.'),
  description: z.string().describe('A short description of the alternate recipe.'),
});

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
  instructions: z.array(RecipeStepSchema).describe('The cooking instructions for the recipe, step by step.'),
  alternateRecipes: z.array(AlternateRecipeSchema).describe('Alternative recipes that can be made with the given ingredients.'),
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
    }),
  },
  output: {
    schema: z.object({
      recipeName: z.string().describe('The name of the generated recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.array(RecipeStepSchema).describe('The cooking instructions for the recipe, step by step, with optional timers.'),
      alternateRecipes: z.array(AlternateRecipeSchema).describe('Alternative recipes that can be made with the given ingredients.'),
      allergyWarning: z.string().optional().describe('A warning if the generated recipe may contain allergens.'),
    }),
  },
  prompt: `You are a world-class chef. Generate a recipe based on the ingredients provided, taking into account any specified allergies.

Ingredients: {{{ingredients}}}
Allergies (if any): {{{allergies}}}

Instructions should be provided step by step. If a step requires a timer, include the time.

Also provide a list of 3 alternative recipes that can be made with the given ingredients.

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
Alternate Recipes:
[
  {
    "name": "Chocolate Chip Cookies",
    "description": "Classic chocolate chip cookies, perfect for a sweet treat."
  },
   {
    "name": "Peanut Butter Cookies",
    "description": "Classic peanut butter cookies, perfect for a sweet treat."
  },
   {
    "name": "Oatmeal Cookies",
    "description": "Classic oatmeal cookies, perfect for a sweet treat."
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
