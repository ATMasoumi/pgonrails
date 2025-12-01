-- Seed iOS Development Tree

DO $$
DECLARE
    v_user_id uuid;
    v_root_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    v_l1_swift uuid := gen_random_uuid();
    v_l1_ui uuid := gen_random_uuid();
    v_l1_data uuid := gen_random_uuid();
    v_l2_var uuid := gen_random_uuid();
    v_l2_func uuid := gen_random_uuid();
    v_l2_view uuid := gen_random_uuid();
BEGIN
    -- 1. Get or Create User
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@doctree.com';
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
        VALUES (
            v_user_id, 
            'demo@doctree.com', 
            '$2a$10$abcdefg...', -- Dummy hash
            now(), 
            '{"provider":"email","providers":["email"]}', 
            '{}', 
            now(), 
            now(), 
            'authenticated', 
            'authenticated'
        );
    END IF;

    -- 2. Insert Root Document
    INSERT INTO public.documents (id, user_id, query, is_public, summary, note)
    VALUES (
        v_root_id,
        v_user_id,
        'iOS Development',
        true,
        'iOS development is the process of creating applications for Apple''s mobile operating system. It involves using the Swift programming language and frameworks like SwiftUI and UIKit to build responsive, performant apps.',
        '## Personal Notes\n\n- Remember to check ARC cycles.\n- SwiftUI is the future, but UIKit is still needed.'
    )
    ON CONFLICT (id) DO UPDATE SET 
        query = EXCLUDED.query,
        is_public = EXCLUDED.is_public,
        summary = EXCLUDED.summary,
        note = EXCLUDED.note;

    -- 3. Insert Child Documents
    -- Swift
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l1_swift, v_user_id, 'Swift Language', v_root_id, true) ON CONFLICT DO NOTHING;
    
    -- Swift Children
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l2_var, v_user_id, 'Variables & Constants', v_l1_swift, true) ON CONFLICT DO NOTHING;
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l2_func, v_user_id, 'Functions & Closures', v_l1_swift, true) ON CONFLICT DO NOTHING;

    -- UI
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l1_ui, v_user_id, 'User Interface', v_root_id, true) ON CONFLICT DO NOTHING;
    
    -- UI Children
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l2_view, v_user_id, 'Views & Modifiers', v_l1_ui, true) ON CONFLICT DO NOTHING;

    -- Data
    INSERT INTO public.documents (id, user_id, query, parent_id, is_public)
    VALUES (v_l1_data, v_user_id, 'Data Persistence', v_root_id, true) ON CONFLICT DO NOTHING;

    -- 4. Insert Quiz
    DELETE FROM public.quizzes WHERE document_id = v_root_id;
    INSERT INTO public.quizzes (document_id, user_id, questions)
    VALUES (
        v_root_id,
        v_user_id,
        '[
            {
                "question": "What is the primary programming language for iOS?",
                "options": ["Java", "Python", "Swift", "C++"],
                "correctAnswer": 2,
                "explanation": "Swift was introduced by Apple in 2014."
            },
            {
                "question": "Which framework is used for declarative UI?",
                "options": ["UIKit", "SwiftUI", "Cocoa", "AppKit"],
                "correctAnswer": 1,
                "explanation": "SwiftUI uses a declarative syntax."
            },
            {
                "question": "What handles memory management in Swift?",
                "options": ["Garbage Collection", "ARC", "Manual", "None"],
                "correctAnswer": 1,
                "explanation": "Automatic Reference Counting (ARC) handles memory."
            }
        ]'::jsonb
    );

    -- 5. Insert Flashcards
    DELETE FROM public.flashcards WHERE document_id = v_root_id;
    INSERT INTO public.flashcards (document_id, user_id, cards)
    VALUES (
        v_root_id,
        v_user_id,
        '[
            {"front": "ARC", "back": "Automatic Reference Counting - memory management in Swift"},
            {"front": "Optional", "back": "A type that represents either a wrapped value or nil"},
            {"front": "Delegate", "back": "A design pattern used to pass data or events between objects"},
            {"front": "Protocol", "back": "A blueprint of methods, properties, and other requirements"},
            {"front": "Closure", "back": "Self-contained blocks of functionality that can be passed around"}
        ]'::jsonb
    );

    -- 6. Insert Resources
    DELETE FROM public.resources WHERE document_id = v_root_id;
    INSERT INTO public.resources (document_id, user_id, data)
    VALUES (
        v_root_id,
        v_user_id,
        '{
            "youtubeVideos": [
                {"title": "Swift in 100 Seconds", "url": "https://www.youtube.com/watch?v=n6X8pC7e8uY", "channelName": "Fireship"},
                {"title": "iOS Roadmap", "url": "https://www.youtube.com/watch?v=UNZpL6F46Ms", "channelName": "Sean Allen"}
            ],
            "articles": [
                {"title": "Swift Documentation", "url": "https://docs.swift.org/swift-book/", "source": "Swift.org"},
                {"title": "Hacking with Swift", "url": "https://www.hackingwithswift.com/", "source": "Paul Hudson"}
            ],
            "books": [
                {"title": "iOS Programming: The Big Nerd Ranch Guide", "author": "Big Nerd Ranch", "description": "Comprehensive guide."}
            ],
            "influencers": [
                {"name": "Paul Hudson", "platform": "Twitter", "handle": "@twostraws", "description": "Swift educator"}
            ]
        }'::jsonb
    );

    -- 7. Insert Podcast
    DELETE FROM public.podcasts WHERE document_id = v_root_id;
    INSERT INTO public.podcasts (document_id, user_id, audio_url)
    VALUES (
        v_root_id,
        v_user_id,
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    );

END $$;
