using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class Proverb
{
    public int id;
    public string text;
    public string meaning;
    public int difficulty;
    public string category;
    public string example;
    public List<string> wrongAnswers;
}

[Serializable]
public class ProverbDatabase
{
    public List<Proverb> proverbs;
}

public class ProverbData : MonoBehaviour
{
    public static ProverbData Instance { get; private set; }
    
    private ProverbDatabase database;
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadProverbs();
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    void LoadProverbs()
    {
        TextAsset jsonFile = Resources.Load<TextAsset>("Data/proverbs");
        if (jsonFile != null)
        {
            database = JsonUtility.FromJson<ProverbDatabase>(jsonFile.text);
            Debug.Log($"Loaded {database.proverbs.Count} proverbs");
        }
        else
        {
            Debug.LogError("Proverbs JSON file not found!");
        }
    }
    
    public List<Proverb> GetProverbsByDifficulty(int difficulty)
    {
        return database.proverbs.FindAll(p => p.difficulty == difficulty);
    }
    
    public Proverb GetRandomProverb()
    {
        if (database.proverbs.Count == 0) return null;
        return database.proverbs[UnityEngine.Random.Range(0, database.proverbs.Count)];
    }
    
    public Proverb GetProverbById(int id)
    {
        return database.proverbs.Find(p => p.id == id);
    }
}
