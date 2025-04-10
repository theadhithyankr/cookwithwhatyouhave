'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateRecipe} from '@/ai/flows/generate-recipe';
import {analyzeNutrientContent} from '@/ai/flows/analyze-nutrient-content';
import {Label} from '@/components/ui/label';
import {Slider} from '@/components/ui/slider';
import {PlusCircle, MinusCircle} from 'lucide-react';

export default function Home() {
  const [ingredients, setIngredients] = useState<
    {name: string; quantity: string; protein: number; fiber: number}[]
  >([{name: '', quantity: '', protein: 50, fiber: 50}]);
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
    if (!ingredients.length) return;

    const ingredientNames = ingredients.map(item => item.name).join(',');
    try {
      const generatedRecipe = await generateRecipe({ingredients: ingredientNames});
      setRecipe(generatedRecipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  const handleAnalyzeNutrients = async () => {
    if (!recipe) return;

    // Format ingredients with quantities for nutrient analysis
    const formattedIngredients = recipe.ingredients.map(ingredient => {
      const foundIngredient = ingredients.find(ing => ing.name === ingredient);
      return {
        name: ingredient,
        quantity: foundIngredient?.quantity || '1 serving', // Default quantity
      };
    });

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

  const handleQuantityChange = (ingredientName: string, quantity: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ing =>
        ing.name === ingredientName ? {...ing, quantity: quantity} : ing
      )
    );
  };

  const handleIngredientNameChange = (index: number, name: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].name = name;
    setIngredients(updatedIngredients);
  };

  const handleProteinChange = (index: number, protein: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].protein = protein;
    setIngredients(updatedIngredients);
  };

  const handleFiberChange = (index: number, fiber: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].fiber = fiber;
    setIngredients(updatedIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {name: '', quantity: '', protein: 50, fiber: 50}]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter Ingredients</CardTitle>
          <CardDescription>
            Specify the ingredients you have, along with their nutrient levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col gap-2 border p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`ingredient-name-${index}`}>Ingredient Name</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id={`ingredient-name-${index}`}
                  value={ingredient.name}
                  onChange={e => handleIngredientNameChange(index, e.target.value)}
                  placeholder="e.g., chicken"
                />
                <Label htmlFor={`ingredient-quantity-${index}`}>Quantity</Label>
                <Input
                  type="text"
                  id={`ingredient-quantity-${index}`}
                  placeholder="e.g., 100g, 2 cups"
                  value={ingredient.quantity}
                  onChange={e => handleQuantityChange(ingredient.name, e.target.value)}
                />
                <Label htmlFor={`protein-level-${index}`}>Protein Level</Label>
                <Slider
                  id={`protein-level-${index}`}
                  defaultValue={[ingredient.protein]}
                  max={100}
                  step={1}
                  onValueChange={value => handleProteinChange(index, value[0])}
                />
                <Label htmlFor={`fiber-level-${index}`}>Fiber Level</Label>
                <Slider
                  id={`fiber-level-${index}`}
                  defaultValue={[ingredient.fiber]}
                  max={100}
                  step={1}
                  onValueChange={value => handleFiberChange(index, value[0])}
                />
              </div>
            ))}
            <Button type="button" onClick={addIngredient}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
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
