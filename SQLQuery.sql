USE NodeAPI;

CREATE TABLE Users (
    id INT PRIMARY KEY,
    name NVARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);

INSERT INTO Users (id, name, email, phone) VALUES
(1, N'Haleemah Redfern', 'Email1@mail.com', '01111111'),
(2, N'Aya Bostock', 'Email2@mail.com', '02222222'),
(3, N'Sohail Perez', 'Email3@mail.com', ''),
(4, N'Merryn Peck', 'Email4@mail.com', '04444444'),
(5, N'Cairon Reynolds', 'Email5@mail.com', '');
