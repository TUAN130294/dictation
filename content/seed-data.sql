-- Sample content for Dictation Practice App
-- Run this SQL in Supabase SQL Editor

INSERT INTO content (level, title, audio_url, transcript, duration) VALUES
-- A1 Level - Basic sentences
('A1', 'Hello and Introduction', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Hello. My name is John. I am from England. I am twenty years old. I like to read books.', 15),
('A1', 'Daily Routine', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'I wake up at seven. I eat breakfast. I go to school. I come home at four. I do my homework.', 18),
('A1', 'My Family', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'I have a small family. My father is a teacher. My mother is a doctor. I have one sister.', 16),

-- A2 Level - Simple conversations
('A2', 'At the Restaurant', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'Good evening. I would like a table for two, please. Can I see the menu? I will have the fish and some water. Thank you very much.', 25),
('A2', 'Shopping for Clothes', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'Excuse me, how much is this shirt? It costs twenty dollars. Do you have it in blue? Yes, here you are. I will take it.', 22),
('A2', 'Weather Talk', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'The weather is nice today. It is sunny and warm. Yesterday it was raining all day. I hope tomorrow will be good too.', 20),

-- B1 Level - Intermediate topics
('B1', 'Job Interview Basics', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'I have been working in marketing for five years. My main responsibilities include managing social media campaigns and analyzing customer data. I am looking for new challenges and opportunities to grow professionally.', 35),
('B1', 'Travel Plans', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'Next summer, I am planning to visit Japan. I have always wanted to see the cherry blossoms in Kyoto. I will probably stay for two weeks and try to learn some basic Japanese phrases before I go.', 40),
('B1', 'Health and Fitness', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'Regular exercise is essential for maintaining good health. I try to go to the gym three times a week. I also pay attention to my diet and try to eat more vegetables and less processed food.', 38),

-- B2 Level - Upper intermediate
('B2', 'Technology Impact', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'Technology has fundamentally transformed the way we communicate with each other. While social media platforms have made it easier to stay connected with friends and family across the globe, there are growing concerns about privacy and the spread of misinformation. It is crucial that we learn to use these tools responsibly.', 55),
('B2', 'Environmental Challenges', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'Climate change represents one of the most pressing challenges of our generation. Rising sea levels and extreme weather events are already affecting communities worldwide. Governments and individuals alike must take immediate action to reduce carbon emissions and transition to renewable energy sources.', 50),
('B2', 'Work-Life Balance', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'Achieving a healthy work-life balance has become increasingly difficult in our always-connected world. Many employees struggle to disconnect from their jobs, leading to burnout and decreased productivity. Companies are beginning to recognize the importance of flexible working arrangements and mental health support.', 52),

-- C1 Level - Advanced
('C1', 'Economic Globalization', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'The phenomenon of economic globalization has both proponents and critics. While supporters argue that free trade and international cooperation have lifted millions out of poverty and fostered innovation, skeptics point to the widening wealth gap and the exploitation of workers in developing countries. The challenge lies in crafting policies that harness the benefits of globalization while mitigating its negative consequences.', 75),
('C1', 'Artificial Intelligence Ethics', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'As artificial intelligence systems become increasingly sophisticated, we must grapple with profound ethical questions. Who is responsible when an autonomous vehicle causes an accident? How do we ensure that algorithmic decision-making does not perpetuate existing biases? These are not merely theoretical concerns but practical challenges that require immediate attention from policymakers, technologists, and society at large.', 80),
('C1', 'Urban Development', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'Sustainable urban development requires a holistic approach that considers environmental, social, and economic factors. Cities must invest in public transportation infrastructure to reduce reliance on private vehicles. Additionally, green spaces and pedestrian-friendly areas are essential for promoting both physical and mental well-being among residents.', 70),

-- C2 Level - Mastery
('C2', 'Philosophical Perspectives', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'The epistemological foundations of modern science rest upon assumptions that, upon closer examination, prove remarkably difficult to justify. The problem of induction, famously articulated by David Hume, calls into question our ability to draw universal conclusions from particular observations. Despite centuries of philosophical inquiry, no wholly satisfactory solution has been proposed, leaving the enterprise of empirical knowledge on somewhat precarious ground.', 95),
('C2', 'Literary Analysis', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'The postmodern literary movement, characterized by its self-reflexivity and skepticism toward grand narratives, fundamentally challenged the conventions of traditional storytelling. Authors such as Thomas Pynchon and Don DeLillo employed techniques including unreliable narration, metafictional commentary, and temporal fragmentation to destabilize readers expectations and interrogate the very nature of textual meaning.', 90),
('C2', 'Quantum Mechanics Explained', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'The counterintuitive principles of quantum mechanics have profound implications for our understanding of reality. The phenomenon of superposition, wherein particles exist in multiple states simultaneously until observed, challenges our classical notions of determinism. Furthermore, quantum entanglement suggests that particles can instantaneously influence one another regardless of the distance separating them, a phenomenon Einstein famously dismissed as spooky action at a distance.', 100);

-- Verify insertion
SELECT level, COUNT(*) as count FROM content GROUP BY level ORDER BY level;
