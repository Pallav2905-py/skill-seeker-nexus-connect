
import { pipeline } from '@huggingface/transformers';

let encoder: any = null;

// Initialize the sentence transformer
export async function initializeEncoder() {
  try {
    encoder = await pipeline(
      'feature-extraction',
      'sentence-transformers/all-MiniLM-L6-v2',
      { quantized: true }
    );
    console.log('Sentence transformer initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize sentence transformer:', error);
    return false;
  }
}

// Generate embeddings for text
export async function generateEmbedding(text: string) {
  if (!encoder) {
    await initializeEncoder();
  }
  
  try {
    const embedding = await encoder(text, { pooling: 'mean', normalize: true });
    return embedding.tolist()[0]; // Return the raw embedding vector
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Calculate similarity between two embeddings
export function calculateSimilarity(embedding1: number[], embedding2: number[]) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions');
  }
  
  // Cosine similarity implementation
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Find job recommendations based on user skills and experience
export async function getJobRecommendations(userId: string, limit: number = 5) {
  // This function would combine the DB operations with the AI logic
  // Implementation will be in the job service
  return [];
}
