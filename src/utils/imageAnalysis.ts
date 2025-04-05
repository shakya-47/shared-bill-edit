
import { Bill } from '@/types';
import { toast } from 'sonner';

// Mock for development - in production, this would call the OpenAI API
// This function simulates the receipt analysis that would typically be done by an AI service
export async function analyzeReceipt(imageBase64: string): Promise<Bill | null> {
  try {
    // For development, we'll just simulate the API call with a timeout
    console.log("Analyzing receipt image...");
    
    // In a real implementation, we'd make a fetch call to OpenAI's API here
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all items, prices, quantities, and totals from this receipt. Format the response as a JSON object with the following structure: { "merchant": string, "date": string in YYYY-MM-DD format, "currency": string, "items": [{ "id": string, "name": string, "quantity": number, "unitPrice": number, "totalPrice": number }], "charges": { "subTotal": number, "tax": number, "serviceCharge": number, "discount": number, "total": number } }'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    const parsedContent = JSON.parse(data.choices[0].message.content);
    return parsedContent;
    
    // For development purposes, return mock data after a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock receipt data
    return {
      merchant: "Pizza Palace",
      date: new Date().toISOString().split('T')[0],
      currency: "INR",
      items: [
        {
          id: "item1",
          name: "Margherita Pizza",
          quantity: 1,
          unitPrice: 300.0,
          totalPrice: 300.0
        },
        {
          id: "item2",
          name: "Coke",
          quantity: 2,
          unitPrice: 50.0,
          totalPrice: 100.0
        },
        {
          id: "item3",
          name: "Garlic Bread",
          quantity: 1,
          unitPrice: 150.0,
          totalPrice: 150.0
        }
      ],
      charges: {
        subTotal: 550.0,
        tax: 55.0,
        serviceCharge: 27.5,
        discount: 0.0,
        total: 632.5
      }
    };
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    toast.error("Failed to analyze the receipt");
    return null;
  }
}
