from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import uvicorn

app = FastAPI()

PORT = 8000

origins = [
    "http://localhost",
    "http://localhost:5173",
    "https://movie-recommender-system-red.vercel.app",
]
# Allow CORS for React frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and data
movies = pd.read_csv("./models/movies.csv")
similarity = pickle.load(open("./models/similarity.pkl", 'rb'))

@app.get("/movies")
def get_movies():
    return movies['title'].tolist()

@app.get("/recommend/{movie_name}")
def recommend(movie_name: str):
    movie_name = movie_name.lower()
    index_list = movies[movies['title'].str.lower() == movie_name].index
    if len(index_list) == 0:
        return {"error": "Movie not found"}

    index = index_list[0]
    distances = list(enumerate(similarity[index]))
    sorted_movies = sorted(distances, key=lambda x: x[1], reverse=True)[:6]
    recommendations = [movies.iloc[i[0]].title for i in sorted_movies]
    return {"recommended": recommendations}


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=PORT)