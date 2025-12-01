-- Seed All Example Trees (iOS, Cinema, Psychology, Nutrition)

DO $$
DECLARE
    v_user_id uuid;
    
    -- Root IDs (Must match ExampleTrees.tsx)
    v_root_ios uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_root_cinema uuid := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    v_root_psych uuid := 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    v_root_nutrition uuid := 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

    -- Helper variables for children
    v_l1 uuid;
    v_l2 uuid;
BEGIN
    -- 1. Get or Create User
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@doctree.com';
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
        VALUES (
            v_user_id, 
            'demo@doctree.com', 
            '$2a$10$abcdefg...', 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            '{}', 
            now(), 
            now(), 
            'authenticated', 
            'authenticated'
        );
    END IF;

    -- ==========================================
    -- TREE 1: iOS Development
    -- ==========================================
    
    -- Cleanup existing
    DELETE FROM public.documents WHERE id = v_root_ios OR parent_id = v_root_ios; -- Cascade should handle children of children if set up, but let's be safe
    -- Actually, cascade delete on parent_id is usually set up. Let's just delete the root.
    DELETE FROM public.documents WHERE id = v_root_ios;

    -- Root
    INSERT INTO public.documents (id, user_id, query, is_public, summary, note, content)
    VALUES (
        v_root_ios,
        v_user_id,
        'iOS Development',
        true,
        'iOS development involves building applications for Apple mobile devices using Swift and SwiftUI. Key concepts include the app lifecycle, view hierarchy, and data management.',
        '## Study Notes
- Focus on **SwiftUI** over UIKit for new apps.
- Master *ARC* (Automatic Reference Counting).
- MVVM is the standard pattern.',
        '# iOS Development Guide

iOS development is the art of creating applications for iPhone, iPad, and other Apple devices. The ecosystem is robust, offering powerful tools like Xcode and a modern language, Swift.

## Key Pillars
1. **Language**: Swift is safe, fast, and expressive.
2. **UI Frameworks**: SwiftUI (Declarative) and UIKit (Imperative).
3. **Data**: CoreData, SwiftData, and URLSession for networking.

Start by installing Xcode from the Mac App Store.'
    );

    -- Children (Swift)
    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'Swift Language', v_root_ios, true, 
    '# The Swift Programming Language
    
Swift is a powerful and intuitive programming language for iOS, iPadOS, macOS, tvOS, and watchOS. Writing Swift code is interactive and fun, the syntax is concise yet expressive, and Swift includes modern features developers love. Swift code is safe by design, yet also produces software that runs lightning-fast.');

        -- Grandchildren
        INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
        VALUES (gen_random_uuid(), v_user_id, 'Variables & Constants', v_l1, true, '# Variables and Constants
        
Use `let` to make a constant and `var` to make a variable. The value of a constant doesn''t need to be known at compile time, but you must assign it a value exactly once.');

    -- Children (SwiftUI)
    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'SwiftUI Framework', v_root_ios, true, 
    '# SwiftUI
    
SwiftUI helps you build great-looking apps across all Apple platforms with the power of Swift — and as little code as possible. With SwiftUI, you can bring even better experiences to all users, on any Apple device, using just one set of tools and APIs.');

    -- Extras for iOS Root
    INSERT INTO public.quizzes (document_id, user_id, questions) VALUES (v_root_ios, v_user_id, '[
        {"question": "What is the primary language for iOS?", "options": ["Java", "Python", "Swift", "C++"], "correctAnswer": 2, "explanation": "Swift is Apple''s modern language."},
        {"question": "Which keyword defines a constant?", "options": ["var", "let", "const", "final"], "correctAnswer": 1, "explanation": "let is used for constants."}
    ]'::jsonb);

    INSERT INTO public.flashcards (document_id, user_id, cards) VALUES (v_root_ios, v_user_id, '[
        {"front": "ARC", "back": "Automatic Reference Counting"},
        {"front": "SwiftUI", "back": "Declarative UI Framework"},
        {"front": "UIKit", "back": "Imperative UI Framework (Legacy)"}
    ]'::jsonb);

    INSERT INTO public.resources (document_id, user_id, data) VALUES (v_root_ios, v_user_id, '{
        "youtubeVideos": [{"title": "Swift in 100 Seconds", "url": "https://youtu.be/n6X8pC7e8uY", "channelName": "Fireship"}],
        "articles": [{"title": "Swift Docs", "url": "https://docs.swift.org", "source": "Apple"}],
        "books": [], "influencers": []
    }'::jsonb);

    INSERT INTO public.podcasts (document_id, user_id, audio_url) VALUES (v_root_ios, v_user_id, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');


    -- ==========================================
    -- TREE 2: History of Cinema
    -- ==========================================
    DELETE FROM public.documents WHERE id = v_root_cinema;

    INSERT INTO public.documents (id, user_id, query, is_public, summary, note, content)
    VALUES (
        v_root_cinema,
        v_user_id,
        'History of Cinema',
        true,
        'A journey through the evolution of film, from the silent era to the digital revolution. Covers major movements like German Expressionism, French New Wave, and Hollywood Golden Age.',
        '## Watchlist
- Metropolis (1927)
- Citizen Kane (1941)
- Breathless (1960)',
        '# The History of Cinema

Cinema has evolved from a novelty carnival act to a global art form and industry.

## Eras
1. **Silent Era (1895-1927)**: Visual storytelling without synchronized sound.
2. **Golden Age (1930s-1950s)**: The rise of the studio system and "talkies".
3. **New Hollywood (1960s-1980s)**: Auteur directors and grittier realism.
4. **Digital Age (1990s-Present)**: CGI and digital distribution.'
    );

    -- Children
    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'The Silent Era', v_root_cinema, true, '# The Silent Era
    
The silent era was a period in film history from 1894 to 1929. During this time, films had no synchronized recorded sound, and dialogue was conveyed via mute gestures and title cards.');

    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'French New Wave', v_root_cinema, true, '# French New Wave
    
La Nouvelle Vague was a film movement that emerged in the late 1950s. It was characterized by a rejection of traditional filmmaking conventions in favor of experimentation and a spirit of iconoclasm.');

    -- Extras
    INSERT INTO public.quizzes (document_id, user_id, questions) VALUES (v_root_cinema, v_user_id, '[
        {"question": "Who directed Citizen Kane?", "options": ["Hitchcock", "Orson Welles", "Spielberg", "Kubrick"], "correctAnswer": 1, "explanation": "Orson Welles directed, produced, and starred in it."},
        {"question": "When did the Silent Era end?", "options": ["1910", "1927", "1945", "1960"], "correctAnswer": 1, "explanation": "The Jazz Singer (1927) marked the end."}
    ]'::jsonb);

    INSERT INTO public.flashcards (document_id, user_id, cards) VALUES (v_root_cinema, v_user_id, '[
        {"front": "Montage", "back": "Editing technique condensing space, time, and information"},
        {"front": "Auteur Theory", "back": "Director is the major creative force"},
        {"front": "Mise-en-scène", "back": "Arrangement of scenery and stage properties"}
    ]'::jsonb);

    INSERT INTO public.resources (document_id, user_id, data) VALUES (v_root_cinema, v_user_id, '{
        "youtubeVideos": [{"title": "History of Film", "url": "https://youtu.be/v=example", "channelName": "CrashCourse"}],
        "articles": [], "books": [], "influencers": []
    }'::jsonb);
    
    INSERT INTO public.podcasts (document_id, user_id, audio_url) VALUES (v_root_cinema, v_user_id, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3');


    -- ==========================================
    -- TREE 3: Psychology 101
    -- ==========================================
    DELETE FROM public.documents WHERE id = v_root_psych;

    INSERT INTO public.documents (id, user_id, query, is_public, summary, note, content)
    VALUES (
        v_root_psych,
        v_user_id,
        'Psychology 101',
        true,
        'Introduction to the scientific study of mind and behavior. Explores biological bases, cognitive processes, developmental stages, and social interactions.',
        '## Key Figures
- Freud (Psychoanalysis)
- Skinner (Behaviorism)
- Piaget (Development)',
        '# Introduction to Psychology

Psychology is the scientific study of the mind and behavior. It is a multifaceted discipline and includes many sub-fields of study such areas as human development, sports, health, clinical, social behavior and cognitive processes.

## Major Schools of Thought
- **Structuralism**
- **Functionalism**
- **Behaviorism**
- **Psychoanalysis**
- **Humanistic Psychology**'
    );

    -- Children
    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'Cognitive Psychology', v_root_psych, true, '# Cognitive Psychology
    
Cognitive psychology is the scientific study of mental processes such as "attention, language use, memory, perception, problem solving, creativity, and thinking".');

    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'Behaviorism', v_root_psych, true, '# Behaviorism
    
Behaviorism is a systematic approach to understanding the behavior of humans and other animals. It assumes that behavior is either a reflex evoked by the pairing of certain antecedent stimuli in the environment, or a consequence of that individual''s history, including especially reinforcement and punishment contingencies.');

    -- Extras
    INSERT INTO public.quizzes (document_id, user_id, questions) VALUES (v_root_psych, v_user_id, '[
        {"question": "Who is the father of psychoanalysis?", "options": ["Jung", "Freud", "Skinner", "Pavlov"], "correctAnswer": 1, "explanation": "Sigmund Freud founded psychoanalysis."},
        {"question": "Pavlov is famous for?", "options": ["Operant Conditioning", "Classical Conditioning", "Cognitive Therapy", "Humanism"], "correctAnswer": 1, "explanation": "Pavlov''s dogs demonstrated classical conditioning."}
    ]'::jsonb);

    INSERT INTO public.flashcards (document_id, user_id, cards) VALUES (v_root_psych, v_user_id, '[
        {"front": "Neuron", "back": "Basic working unit of the brain"},
        {"front": "Synapse", "back": "Gap between neurons where communication occurs"},
        {"front": "Plasticity", "back": "Brain''s ability to reorganize itself"}
    ]'::jsonb);

    INSERT INTO public.resources (document_id, user_id, data) VALUES (v_root_psych, v_user_id, '{
        "youtubeVideos": [{"title": "Intro to Psychology", "url": "https://youtu.be/vo4pMVb0R6M", "channelName": "CrashCourse"}],
        "articles": [], "books": [], "influencers": []
    }'::jsonb);

    INSERT INTO public.podcasts (document_id, user_id, audio_url) VALUES (v_root_psych, v_user_id, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3');


    -- ==========================================
    -- TREE 4: Nutrition Basics
    -- ==========================================
    DELETE FROM public.documents WHERE id = v_root_nutrition;

    INSERT INTO public.documents (id, user_id, query, is_public, summary, note, content)
    VALUES (
        v_root_nutrition,
        v_user_id,
        'Nutrition Basics',
        true,
        'Fundamentals of human nutrition, including macronutrients, micronutrients, digestion, and dietary guidelines for health.',
        '## Daily Goals
- Drink 3L water
- 5 servings of veg
- Limit added sugar',
        '# Nutrition Basics

Nutrition is the biochemical and physiological process by which an organism uses food to support its life. It includes ingestion, absorption, assimilation, biosynthesis, catabolism and excretion.

## The Big Three (Macros)
1. **Carbohydrates**: Primary energy source.
2. **Proteins**: Building blocks for tissues.
3. **Fats**: Energy storage and hormone production.'
    );

    -- Children
    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'Macronutrients', v_root_nutrition, true, '# Macronutrients
    
Macronutrients are the nutrients we need in larger quantities that provide us with energy: in other words, fat, protein and carbohydrate.');

    v_l1 := gen_random_uuid();
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public, content)
    VALUES (v_l1, v_user_id, 'Micronutrients', v_root_nutrition, true, '# Micronutrients
    
Micronutrients are vitamins and minerals needed by the body in very small amounts. However, their impact on a body''s health are critical, and deficiency in any of them can cause severe and even life-threatening conditions.');

    -- Extras
    INSERT INTO public.quizzes (document_id, user_id, questions) VALUES (v_root_nutrition, v_user_id, '[
        {"question": "Which is a macronutrient?", "options": ["Vitamin C", "Iron", "Protein", "Zinc"], "correctAnswer": 2, "explanation": "Protein is needed in large amounts."},
        {"question": "How many calories in 1g of fat?", "options": ["4", "7", "9", "12"], "correctAnswer": 2, "explanation": "Fats are energy dense with 9kcal/g."}
    ]'::jsonb);

    INSERT INTO public.flashcards (document_id, user_id, cards) VALUES (v_root_nutrition, v_user_id, '[
        {"front": "Calorie", "back": "Unit of energy"},
        {"front": "Amino Acids", "back": "Building blocks of protein"},
        {"front": "Fiber", "back": "Indigestible carbohydrate essential for digestion"}
    ]'::jsonb);

    INSERT INTO public.resources (document_id, user_id, data) VALUES (v_root_nutrition, v_user_id, '{
        "youtubeVideos": [{"title": "Nutrition Overview", "url": "https://youtu.be/example", "channelName": "HealthChannel"}],
        "articles": [], "books": [], "influencers": []
    }'::jsonb);

    INSERT INTO public.podcasts (document_id, user_id, audio_url) VALUES (v_root_nutrition, v_user_id, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');

END $$;
