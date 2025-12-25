use bu8rhot9lusrkxnboccd;
create table Sach (
	MaSach int auto_increment primary key,
    TenSach nvarchar(100),
    MaTheLoai int,
    MaNguoiDich int,
    MaNXB int,
    GiaSach decimal(10,2),
    NamXuatBan datetime,
    SoTrang int,
    MoTaNoiDung text,
    LinkHinhAnh varchar(255),
    
    FOREIGN KEY (MaTheLoai) REFERENCES TheLoai(MaTheLoai),
    FOREIGN KEY (MaNXB) REFERENCES NhaXuatBan(MaNXB)
);

CREATE TABLE SachTacGia (
    MaSach INT,
    MaTacGia INT,
    PRIMARY KEY (MaSach, MaTacGia),
    FOREIGN KEY (MaSach) REFERENCES Sach(MaSach) ON DELETE CASCADE,
    FOREIGN KEY (MaTacGia) REFERENCES TacGia(MaTacGia) ON DELETE CASCADE
);

CREATE TABLE Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username NVARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50)
);
