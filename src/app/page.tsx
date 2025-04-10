
'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateRecipe} from '@/ai/flows/generate-recipe';
import {analyzeNutrientContent} from '@/ai/flows/analyze-nutrient-content';
import {Label} from '@/components/ui/label';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<{
    recipeName: string;
    ingredients: string[];
    instructions: string;
  } | null>(null);
  const [nutrientAnalysis, setNutrientAnalysis] = useState<{
    ingredientAnalyses: any[]; // Replace 'any' with a more specific type if possible
    recipeAnalysis: any; // Replace 'any' with a more specific type if possible
  } | null>(null);
  const [ingredientQuantities, setIngredientQuantities] = useState<{[key: string]: string}>({});

  const handleGenerateRecipe = async () => {
    if (!ingredients) return;

    try {
      const generatedRecipe = await generateRecipe({ingredients});
      setRecipe(generatedRecipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  const handleAnalyzeNutrients = async () => {
    if (!recipe) return;

    // Format ingredients with quantities for nutrient analysis
    const formattedIngredients = recipe.ingredients.map(ingredient => ({
      name: ingredient,
      quantity: ingredientQuantities[ingredient] || '1 serving', // Default quantity
    }));

    try {
      const analysis = await analyzeNutrientContent({
        recipeName: recipe.recipeName,
        ingredients: formattedIngredients,
      });
      setNutrientAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing nutrients:', error);
    }
  };

  const handleQuantityChange = (ingredient: string, quantity: string) => {
    setIngredientQuantities(prev => ({...prev, [ingredient]: quantity}));
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter Ingredients</CardTitle>
          <CardDescription>
            Specify the ingredients you have in your fridge (comma-separated).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Input
              id="ingredients"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              placeholder="e.g., chicken, broccoli, rice"
            />
            <Button onClick={handleGenerateRecipe}>Generate Recipe</Button>
          </div>
        </CardContent>
      </Card>

      {recipe && (
        <Card>
          <CardHeader>
            <CardTitle>{recipe.recipeName}</CardTitle>
            <CardDescription>Here's a recipe based on your ingredients:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold">Ingredients:</h3>
                <ul className="list-disc pl-5">
                  {recipe.ingredients.map(ingredient => (
                    <li key={ingredient} className="flex items-center justify-between">
                      {ingredient}
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`quantity-${ingredient}`} className="text-sm">
                          Quantity:
                        </Label>
                        <Input
                          type="text"
                          id={`quantity-${ingredient}`}
                          placeholder="e.g., 100g, 2 cups"
                          className="w-32 text-sm"
                          value={ingredientQuantities[ingredient] || ''}
                          onChange={e => handleQuantityChange(ingredient, e.target.value)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instructions:</h3>
                <Textarea readOnly value={recipe.instructions} className="min-h-[100px]" />
              </div>
              <Button onClick={handleAnalyzeNutrients}>Analyze Nutrients</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {nutrientAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Nutrient Analysis</CardTitle>
            <CardDescription>
              Here's the nutrient breakdown of your recipe:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-xl font-semibold">Recipe Analysis:</h3>
              <p>Total Calories: {nutrientAnalysis.recipeAnalysis.totalCalories}</p>
              <h4 className="text-lg font-semibold mt-2">Macronutrients:</h4>
              <ul>
                {nutrientAnalysis.recipeAnalysis.macronutrients.map((nutrient, index) => (
                  <li key={index}>
                    {nutrient.name}: {nutrient.amount} {nutrient.unit}
                  </li>
                ))}
              </ul>
              <h4 className="text-lg font-semibold mt-2">Micronutrients:</h4>
              <ul>
                {nutrientAnalysis.recipeAnalysis.micronutrients.map((nutrient, index) => (
                  <li key={index}>
                    {nutrient.name}: {nutrient.amount} {nutrient.unit}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                Healthiness Assessment: {nutrientAnalysis.recipeAnalysis.healthinessAssessment}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold">Ingredient Analyses:</h3>
              {nutrientAnalysis.ingredientAnalyses.map((ingredient, index) => (
                <div key={index} className="mt-2">
                  <h4 className="text-lg font-semibold">{ingredient.name}:</h4>
                  <h5 className="text-md font-semibold">Macronutrients:</h5>
                  <ul>
                    {ingredient.macronutrients.map((nutrient, i) => (
                      <li key={i}>
                        {nutrient.name}: {nutrient.amount} {nutrient.unit}
                      </li>
                    ))}
                  </ul>
                  <h5 className="text-md font-semibold">Micronutrients:</h5>
                  <ul>
                    {ingredient.micronutrients.map((nutrient, i) => (
                      <li key={i}>
                        {nutrient.name}: {nutrient.amount} {nutrient.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
}

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
