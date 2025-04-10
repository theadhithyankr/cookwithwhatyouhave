'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateRecipe, GenerateRecipeOutput} from '@/ai/flows/generate-recipe';
import {analyzeNutrientContent, AnalyzeNutrientContentOutput} from '@/ai/flows/analyze-nutrient-content';
import {Label} from '@/components/ui/label';
import {PlusCircle, MinusCircle} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from '@/components/ui/toaster';
import {useEffect} from 'react';
import {Checkbox} from '@/components/ui/checkbox';
import {Separator} from '@/components/ui/separator';
import {Progress} from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useRouter } from 'next/navigation';

export default function Home() {
  const [ingredients, setIngredients] = useState<
    {name: string; quantity: string}[]
  >([{name: '', quantity: ''}]);
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [nutrientAnalysis, setNutrientAnalysis] = useState<AnalyzeNutrientContentOutput | null>(null);
  const [allergies, setAllergies] = useState('');
    const [strictMode, setStrictMode] = useState(false); // State for strict mode
  const {toast} = useToast();
  const router = useRouter();

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
      const generatedRecipe = await generateRecipe({
        ingredients: ingredientNames,
        allergies: allergies,
        strictMode: strictMode, // Pass strictMode to the generateRecipe function
      });
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

  const handleIngredientNameChange = (index: number, name: string) => {
    setIngredients(prevIngredients => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index].name = name;
      return updatedIngredients;
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {name: '', quantity: ''}]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  const RecipeStep = ({step, timer}: {step: string; timer?: string}) => {
    const [completed, setCompleted] = useState(false);
        const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

        useEffect(() => {
            if (timer) {
                const timeParts = timer.split(':');
                setHours(parseInt(timeParts[0]) || 0);
                setMinutes(parseInt(timeParts[1]) || 0);
                setSeconds(parseInt(timeParts[2]) || 0);
            }
        }, [timer]);

    useEffect(() => {
      let totalSeconds = hours * 3600 + minutes * 60 + seconds;

      if (isRunning && totalSeconds > 0) {
        const intervalId = setInterval(() => {
          if (totalSeconds > 0) {
            totalSeconds--;
            setHours(Math.floor(totalSeconds / 3600));
            setMinutes(Math.floor((totalSeconds % 3600) / 60));
            setSeconds(totalSeconds % 60);
          } else {
            setIsRunning(false);
          }
        }, 1000);
        return () => clearInterval(intervalId);
      } else if (totalSeconds === 0) {
        setIsRunning(false);
      }
    }, [isRunning, hours, minutes, seconds]);

    const toggleTimer = () => {
      setIsRunning(!isRunning);
    };

    const formatTime = (time: number) => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = time % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return (
      <div className="flex items-center justify-between py-2">
        <label className="flex items-center space-x-2">
          <Checkbox checked={completed} onCheckedChange={() => setCompleted(!completed)} />
          <span>{step}</span>
        </label>
        {timer && (
          <span className="text-sm text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-timer inline-block h-4 w-4 mr-1"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {isRunning ? `Running: ${formatTime(totalSeconds)}` : `Set time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            <Button
              variant="outline"
              size="xs"
              onClick={toggleTimer}
              disabled={completed}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </span>
        )}
      </div>
    );
  };

  const NutrientMeter = ({ nutrient, amount, unit, description }: { nutrient: string; amount: number; unit: string; description: string }) => (
    <div className="mb-4">
      <h4 className="text-lg font-semibold">{nutrient}</h4>
      <Progress value={amount} />
      <p className="text-sm text-muted-foreground">
        {amount} {unit} - {description}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto p-6 flex flex-col gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recipe Generator</CardTitle>
          <CardDescription>Add ingredients to generate a recipe and analyze its nutrients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Label htmlFor="allergies">Allergies (optional)</Label>
            <Input
              type="text"
              id="allergies"
              placeholder="e.g., peanuts, gluten, dairy"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              className="rounded-md shadow-sm"
            />
                        <div className="flex items-center space-x-2">
              <Checkbox
                id="strict-mode"
                checked={strictMode}
                onCheckedChange={setStrictMode}
              />
              <Label htmlFor="strict-mode">Strict Mode (Only use provided ingredients)</Label>
            </div>
            <Separator className="my-4" />
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
            {recipe.allergyWarning && (
              <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
                <strong className="font-bold">Allergy Warning:</strong> {recipe.allergyWarning}
              </div>
            )}
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
                <div>
                  {recipe.instructions.map((step, index) => (
                    <RecipeStep key={index} step={step.step} timer={step.timer} />
                  ))}
                </div>
              </div>
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
              <h3 className="text-xl font-semibold">Nutrient Meters:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nutrientAnalysis.recipeAnalysis.macronutrients.map((nutrient, index) => (
                  <NutrientMeter
                    key={index}
                    nutrient={nutrient.name}
                    amount={parseFloat(nutrient.amount)}
                    unit={nutrient.unit}
                    description={
                      nutrient.name === 'Protein' ? 'Essential for muscle building and repair.' :
                      nutrient.name === 'Fat' ? 'Provides energy and supports cell growth.' :
                      nutrient.name === 'Carbohydrates' ? 'Main source of energy for the body.' :
                      'Important for various bodily functions.'
                    }
                  />
                ))}
                {nutrientAnalysis.recipeAnalysis.micronutrients.map((nutrient, index) => (
                  <NutrientMeter
                    key={index}
                    nutrient={nutrient.name}
                    amount={parseFloat(nutrient.amount)}
                    unit={nutrient.unit}
                    description={'Important for various bodily functions.'}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Macronutrient Ratios:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Protein</Label>
                  <Progress value={parseFloat(nutrientAnalysis.recipeAnalysis.macronutrients.find(m => m.name === 'Protein')?.amount || '0')} />
                </div>
                <div>
                  <Label>Fiber</Label>
                  <Progress value={parseFloat(nutrientAnalysis.recipeAnalysis.macronutrients.find(m => m.name === 'Fiber')?.amount || '0')} />
                </div>
                <div>
                  <Label>Carbohydrates</Label>
                  <Progress value={parseFloat(nutrientAnalysis.recipeAnalysis.macronutrients.find(m => m.name === 'Carbohydrates')?.amount || '0')} />
                </div>
                <div>
                  <Label>Fat</Label>
                  <Progress value={parseFloat(nutrientAnalysis.recipeAnalysis.macronutrients.find(m => m.name === 'Fat')?.amount || '0')} />
                </div>
              </div>
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
