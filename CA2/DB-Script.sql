/*
ERD included as an image file - ERD.png.
*/


drop table [dbo].[Comment]
drop table [dbo].[Post]
drop table [dbo].[Netizen]
 

/****** Table [dbo].[Netizen] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Yes I am aware this is not a good name for a table of users, 
--I am trying to avoid using the same names as in the labs
CREATE TABLE [dbo].[Netizen]( 
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](255) NULL,
	[email] [nvarchar](255) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[role] [nvarchar](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Table [dbo].[Post] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Post](
	[post_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[post_body] [nvarchar](255) NOT NULL,
	[upload_time] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[post_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Table [dbo].[Comment] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Comment](
	[comment_id] [int] IDENTITY(1,1) NOT NULL,
	[post_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[comment_body] [nvarchar](255) NOT NULL,
	[upload_time] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[comment_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

SET IDENTITY_INSERT [dbo].[Netizen] ON 
GO
INSERT [dbo].[Netizen] ([user_id], [username], [email], [password], [role]) VALUES (1, N'Alice', N'alice@sswd.com', N'password', N'user')
GO
INSERT [dbo].[Netizen] ([user_id], [username], [email], [password], [role]) VALUES (2, N'Bob', N'bob@sswd.com', N'password', N'user')
GO
INSERT [dbo].[Netizen] ([user_id], [username], [email], [password], [role]) VALUES (3, N'BigBrother', N'bb@sswd.com', N'password', N'admin')
GO
SET IDENTITY_INSERT [dbo].[Netizen] OFF
GO

SET IDENTITY_INSERT [dbo].[Post] ON 
GO
INSERT [dbo].[Post] ([post_id], [user_id], [post_body], [upload_time]) VALUES (1, 1, N'First post on this website', CAST(N'2019-12-08 00:18:24.620' AS DateTime))
GO
INSERT [dbo].[Post] ([post_id], [user_id], [post_body], [upload_time]) VALUES (2, 1, N'Second post on this website', CAST(N'2019-12-08 00:19:27.137' AS DateTime))
GO
INSERT [dbo].[Post] ([post_id], [user_id], [post_body], [upload_time]) VALUES (3, 2, N'Hello! What is this website about?', CAST(N'2019-12-08 00:20:06.980' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Post] OFF
GO

SET IDENTITY_INSERT [dbo].[Comment] ON 
GO
INSERT [dbo].[Comment] ([comment_id], [post_id], [user_id], [comment_body], [upload_time]) VALUES (1, 1, 2, N'And this is my first comment!', CAST(N'2019-12-08 00:19:28.000' AS DateTime))
GO
INSERT [dbo].[Comment] ([comment_id], [post_id], [user_id], [comment_body], [upload_time]) VALUES (2, 1, 2, N'And this is my second comment on this post!', CAST(N'2019-12-08 00:19:30.500' AS DateTime))
GO
INSERT [dbo].[Comment] ([comment_id], [post_id], [user_id], [comment_body], [upload_time]) VALUES (3, 3, 1, N'Pavel had to create a server using Node.js and Express.', CAST(N'2019-12-08 00:21:06.000' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Comment] OFF
GO

ALTER TABLE [dbo].[Netizen] ADD  DEFAULT ((N'')) FOR [last_name]
GO

ALTER TABLE [dbo].[Post]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Netizen] ([user_id])
GO
ALTER TABLE [dbo].[Comment]  WITH CHECK ADD FOREIGN KEY([post_id])
REFERENCES [dbo].[Post] ([post_id])
GO
ALTER TABLE [dbo].[Comment]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Netizen] ([user_id])
GO

CREATE USER webUser WITH PASSWORD = 'Password@12345';
grant select,insert,update,delete on object::dbo.Netizen to webUser
grant select,insert,update,delete on object::dbo.Post to webUser
grant select,insert,update,delete on object::dbo.Comment to webUser