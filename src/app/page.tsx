'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateRecipe} from '@/ai/flows/generate-recipe';
import {analyzeNutrientContent} from '@/ai/flows/analyze-nutrient-content';
import {Label} from '@/components/ui/label';
import {Slider} from '@/components/ui/slider';
import {PlusCircle, MinusCircle} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from '@/components/ui/toaster';

export default function Home() {
  const [ingredients, setIngredients] = useState<
    {name: string; quantity: string; protein: number; fiber: number; image: string}[]
  >([{name: '', quantity: '', protein: 50, fiber: 50, image: ''}]);
  const [recipe, setRecipe] = useState<{
    recipeName: string;
    ingredients: string[];
    instructions: string;
  } | null>(null);
  const [nutrientAnalysis, setNutrientAnalysis] = useState<{
    ingredientAnalyses: any[];
    recipeAnalysis: any;
  } | null>(null);
  const [ingredientImages, setIngredientImages] = useState<{[key: string]: string}>({});
  const {toast} = useToast();

  const handleGenerateRecipe = async () => {
    if (!ingredients.length) {
      toast({
        title: 'No ingredients added',
        description: 'Please add ingredients to generate a recipe.',
      });
      return;
    }

    const ingredientNames = ingredients.map(item => item.name).join(',');
    try {
      const generatedRecipe = await generateRecipe({ingredients: ingredientNames});
      setRecipe(generatedRecipe);
      toast({
        title: 'Recipe generated',
        description: 'A recipe has been generated based on your ingredients.',
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Error generating recipe',
        description: 'Failed to generate a recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAnalyzeNutrients = async () => {
    if (!recipe) {
      toast({
        title: 'No recipe generated',
        description: 'Please generate a recipe first.',
      });
      return;
    }

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
      toast({
        title: 'Nutrient analysis complete',
        description: 'The nutrient analysis for the recipe has been calculated.',
      });
    } catch (error) {
      console.error('Error analyzing nutrients:', error);
      toast({
        title: 'Error analyzing nutrients',
        description: 'Failed to analyze nutrients. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    setIngredients(prevIngredients => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index].quantity = quantity;
      return updatedIngredients;
    });
  };

  const handleIngredientNameChange = async (index: number, name: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].name = name;
    setIngredients(updatedIngredients);
    fetchImage(name, index);
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
    setIngredients([...ingredients, {name: '', quantity: '', protein: 50, fiber: 50, image: ''}]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const fetchImage = async (name: string, index: number) => {
    try {
      const response = await fetch(`https://picsum.photos/200/200?text=${name}`);
      const imageUrl = response.url;

      setIngredients(prevIngredients => {
        const updatedIngredients = [...prevIngredients];
        updatedIngredients[index].image = imageUrl;
        return updatedIngredients;
      });

    } catch (error) {
      console.error('Failed to fetch image:', error);
      setIngredients(prevIngredients => {
        const updatedIngredients = [...prevIngredients];
        updatedIngredients[index].image = '';
        return updatedIngredients;
      });
    }
  };

  return (
    <div className="container mx-auto p-6 flex flex-col gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recipe Generator</CardTitle>
          <CardDescription>Add ingredients to generate a recipe and analyze its nutrients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col gap-4 border p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`ingredient-name-${index}`} className="text-lg font-semibold">Ingredient Name</Label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Input
                      id={`ingredient-name-${index}`}
                      value={ingredient.name}
                      onChange={e => handleIngredientNameChange(index, e.target.value)}
                      placeholder="e.g., chicken"
                      className="rounded-md shadow-sm"
                    />
                    {ingredient.image && (
                      <img
                        src={ingredient.image}
                        alt={ingredient.name}
                        className="mt-2 rounded-md object-cover w-full h-32"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor={`ingredient-quantity-${index}`}>Quantity</Label>
                    <Input
                      type="text"
                      id={`ingredient-quantity-${index}`}
                      placeholder="e.g., 100g, 2 cups"
                      value={ingredient.quantity}
                      onChange={e => handleQuantityChange(index, e.target.value)}
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`protein-${index}`}>Protein Level</Label>
                    <Slider
                      id={`protein-${index}`}
                      defaultValue={[ingredient.protein]}
                      max={100}
                      step={1}
                      onValueChange={value => handleProteinChange(index, value[0])}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Protein: {ingredient.protein}</p>
                  </div>
                  <div>
                    <Label htmlFor={`fiber-${index}`}>Fiber Level</Label>
                    <Slider
                      id={`fiber-${index}`}
                      defaultValue={[ingredient.fiber]}
                      max={100}
                      step={1}
                      onValueChange={value => handleFiberChange(index, value[0])}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Fiber: {ingredient.fiber}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addIngredient} className="bg-green-500 hover:bg-green-700 text-white font-bold rounded-md shadow-md">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
            <Button onClick={handleGenerateRecipe} className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-md shadow-md">Generate Recipe</Button>
          </div>
        </CardContent>
      </Card>

      {recipe && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{recipe.recipeName}</CardTitle>
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
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instructions:</h3>
                <Textarea readOnly value={recipe.instructions} className="min-h-[100px] rounded-md shadow-sm" />
              </div>
              <Button onClick={handleAnalyzeNutrients} className="bg-purple-500 hover:bg-purple-700 text-white font-bold rounded-md shadow-md">Analyze Nutrients</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {nutrientAnalysis && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Nutrient Analysis</CardTitle>
            <CardDescription>Here's the nutrient breakdown of your recipe:</CardDescription>
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
            {nutrientAnalysis && nutrientAnalysis.recipeAnalysis && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">Nutrient Scale:</h3>
                <div className="grid gap-2">
                  <NutrientBar
                    label="Protein"
                    value={parseFloat(
                      nutrientAnalysis.recipeAnalysis.macronutrients.find(
                        nutrient => nutrient.name === 'Protein'
                      )?.amount || '0'
                    )}
                    unit="g"
                  />
                  <NutrientBar
                    label="Fiber"
                    value={parseFloat(
                      nutrientAnalysis.recipeAnalysis.micronutrients.find(
                        nutrient => nutrient.name === 'Fiber'
                      )?.amount || '0'
                    )}
                    unit="g"
                  />
                  <NutrientBar
                    label="Carbs"
                    value={parseFloat(
                      nutrientAnalysis.recipeAnalysis.macronutrients.find(
                        nutrient => nutrient.name === 'Carbohydrates'
                      )?.amount || '0'
                    )}
                    unit="g"
                  />
                  <NutrientBar
                    label="Fat"
                    value={parseFloat(
                      nutrientAnalysis.recipeAnalysis.macronutrients.find(
                        nutrient => nutrient.name === 'Fat'
                      )?.amount || '0'
                    )}
                    unit="g"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
}

function NutrientBar({label, value, unit}: {label: string; value: number; unit: string}) {
  const percentage = Math.min(value, 100); // Cap at 100% for display purposes
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span>
          {value}
          {unit}
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
