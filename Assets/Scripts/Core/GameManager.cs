using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    private int currentScore = 0;
    private int currentLevel = 1;
    private int consecutiveCorrect = 0;
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    public void AddScore(int points)
    {
        currentScore += points;
        consecutiveCorrect++;
        
        // Bonus için peş peşe doğru cevaplar
        if (consecutiveCorrect >= 3)
        {
            int bonus = consecutiveCorrect * 10;
            currentScore += bonus;
            Debug.Log($"Bonus! +{bonus} puan");
        }
        
        CheckLevelUp();
    }
    
    public void ResetConsecutive()
    {
        consecutiveCorrect = 0;
    }
    
    void CheckLevelUp()
    {
        int requiredScore = currentLevel * 100;
        if (currentScore >= requiredScore)
        {
            currentLevel++;
            Debug.Log($"Seviye atladın! Yeni seviye: {currentLevel}");
        }
    }
    
    public int GetScore() => currentScore;
    public int GetLevel() => currentLevel;
    public int GetConsecutive() => consecutiveCorrect;
}
