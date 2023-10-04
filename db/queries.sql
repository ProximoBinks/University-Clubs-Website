INSERT INTO Clubs (
    club_info,
    image_url,
    page_url,
    club_name
) VALUES (
    ?,
    ?,
    ?,
    ?
);

INSERT INTO Updates (
    post_title,
    post_info,
    post_created,
    event_time,
    isPrivate,
    club_id
) VALUES (
    'test post 2',
    'this is a test post',
    CURRENT_TIMESTAMP(),
    NULL,
    TRUE,
    2
);

INSERT INTO Club_Enrolments (
    user_id,
    club_id,
    is_manager
) VALUES (
    1,
    1,
    FALSE
);

INSERT INTO Event_RSVPs (
    user_id,
    event_id,
    is_coming
) VALUES (
    1,
    1,
    TRUE
);