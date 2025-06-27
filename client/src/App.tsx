
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.incrementCounter.mutate();
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async () => {
    setIsLoading(true);
    try {
      const result = await trpc.decrementCounter.mutate();
      setCounter(result);
    } catch (error) {
      console.error('Failed to decrement counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Counter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {counter.value}
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {counter.updated_at.toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleDecrement}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-24 h-12 text-lg font-semibold"
            >
              -
            </Button>
            <Button
              onClick={handleIncrement}
              disabled={isLoading}
              size="lg"
              className="w-24 h-12 text-lg font-semibold"
            >
              +
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center text-sm text-gray-500">
              Updating...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
