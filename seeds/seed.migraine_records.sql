TRUNCATE 
    migraine_users,
    migraine_records
    RESTART IDENTITY CASCADE;

INSERT INTO migraine_records (trigger, symptom, treatment, comment) VALUES
    ('Lack of sleep', 'Prodrome', 'Dark room', 'This attack began mid-afternoon while working.'),
    ('Anxiety', 'Pounding pain', 'Cold compress', 'This attack began in my sleep.'),
    ('Processed food', 'Nausea', 'Medicine', 'Caffeine helped a little.');

INSERT INTO migraine_users (first_name, last_name, email, password)
VALUES
    ('Michael', 'Scott', 'michael@dunder.com', 'password1'),
    ('Dwight', 'Schrute', 'dwight@dunder.com', 'password1'),
    ('Pam', 'Beesly', 'pam@dunder.com', 'password');
