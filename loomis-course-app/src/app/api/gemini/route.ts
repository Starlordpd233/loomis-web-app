import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, courseContext } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const mockResponse = generateMockResponse(message, courseContext);
    return NextResponse.json({
      response: mockResponse,
      mode: 'mock'
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

function generateMockResponse(message: string, courseContext?: any): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('computer science') || lowerMessage.includes('coding') || lowerMessage.includes('programming')) {
    return `Based on your interest in computer science, I'd recommend:

1. **INTRODUCTION TO PROBLEM SOLVING IN MANUFACTURING, SOCIETY, AND ENTREPRENEURSHIP** - This course introduces design thinking and manufacturing experience in the makerspace, perfect for students interested in practical problem-solving.

2. **PROBLEM SOLVING FOR THE COMMON GOOD** - Apply design thinking to real-world problems while working on campus and community challenges.

Both courses meet in the Pearse Hub for Innovation and provide hands-on experience.`;
  }

  if (lowerMessage.includes('science') || lowerMessage.includes('biology') || lowerMessage.includes('chemistry')) {
    return `For your interest in science, consider these options:

1. **ADVANCED BIOLOGY** - Deepen your understanding of biological systems and laboratory techniques.

2. **CHEMISTRY** - Explore fundamental chemical principles through hands-on experiments and problem-solving.

I recommend starting with introductory courses if you're new to the subject, or advanced courses if you have prior experience.`;
  }

  if (lowerMessage.includes('math')) {
    return `For mathematics, here are some strong options:

1. **PRECALCULUS** - Essential foundation for advanced mathematics and science courses.

2. **CALCULUS** - Explore rates of change and accumulation with practical applications.

Let me know your current math level and I can provide more specific recommendations!`;
  }

  return `Thanks for your message! I'm here to help you find the perfect courses at Loomis Chaffee. 

Could you tell me more about:
- Your grade level
- Subjects you enjoy
- Your academic goals
- Any specific interests (STEM, arts, humanities, etc.)

This will help me provide personalized course recommendations from our catalog of 300+ offerings.`;
}
