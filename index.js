const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

const saveArticlesToDB = (articles) => {
    const sql = `INSERT INTO articles (title, description, url, published_at) VALUES (?, ?, ?, ?)`;

    articles.forEach((article) => {
        db.query(sql, [article.title, article.description, article.url, article.publishedAt], (err, result) => {
            if (err) {
                console.error('Error inserting article:', err.message);
            } else {
                console.log('Article saved:', article.title);
            }
        });
    });
};

const getLatestNews = async (keyword = 'technology', pageSize = 5) => {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything`;

    try {
        const response = await axios.get(url, {
            params: {
                q: keyword,
                pageSize,
                apiKey,
            },
        });

        const articles = response.data.articles;

        const formattedArticles = articles.map((article) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: new Date(article.publishedAt), 
        }));

        return formattedArticles;
    } catch (error) {
        console.error('Error fetching news:', error.message);
        return [];
    }
};

(async () => {
    const news = await getLatestNews('technology', 5);

    if (news.length > 0) {
        saveArticlesToDB(news);
    } else {
        console.log('No news to save.');
    }

    db.end();
})();
