__author__ = 'igor'

import pandas as pd

df=pd.read_csv("swadesh.csv")
df["en"]=df['English'].str.replace("^to","to ")
df['ru']=df['Russian'].str.replace("\(.+?\)","").str.split(",").map(lambda x: x[0])
df['de']=df['German'].str.replace("\(.+?\)","")

df[['de','ru','en']].to_json("swadesh.json",orient='records')

