TRUNCATE 
    migraine_users,
    migraine_records
    RESTART IDENTITY CASCADE;

INSERT INTO migraine_users (first_name, last_name, email, password)
VALUES
    ('Michael', 'Scott', 'michael@dunder.com', '$2a$12$JN0JlQ2LtkmGxwUVL.oFh.OP9liWyY7m..VLOOmEKruHgTOef5GL.'),
    ('Dwight', 'Schrute', 'dwight@dunder.com', '$2a$12$eObnq8BJ.8TJWZv9fSRgAecJdebfCfjiXGiWxDj8pN4OH9bSDU4jm'),
    ('Pam', 'Beesly', 'pam@dunder.com', '$2a$12$22M9ve9IbaqChSsa/aEw0OkSCGtqu4UglPICmtqXpnIm4LQ/jp3OC');


INSERT INTO migraine_records (user_id, trigger, symptom, treatment, comment) VALUES
    (1, 'Lack of sleep', 'Prodrome', 'Dark room', 'This attack began mid-afternoon while working.'),
    (2, 'Anxiety', 'Pounding pain', 'Cold compress', 'This attack began in my sleep.'),
    (1, 'Processed food', 'Nausea', 'Medicine', 'Caffeine helped a little.');
