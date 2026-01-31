using UnityEngine;

public class LevelManager : MonoBehaviour
{
    public enum GameMode
    {
        Matching,
        FillBlank,
        MultipleChoice,
        WordOrder,
        StoryMatch
    }
    
    private GameMode currentMode;
    private int currentDifficulty = 1;
    
    public void StartGame(GameMode mode)
    {
        currentMode = mode;
        LoadGameMode();
    }
    
    void LoadGameMode()
    {
        switch (currentMode)
        {
            case GameMode.Matching:
                Debug.Log("Eşleştirme oyunu başlatılıyor...");
                break;
            case GameMode.FillBlank:
                Debug.Log("Eksik kelime oyunu başlatılıyor...");
                break;
            case GameMode.MultipleChoice:
                Debug.Log("Çoktan seçmeli test başlatılıyor...");
                break;
            case GameMode.WordOrder:
                Debug.Log("Kelime sıralama oyunu başlatılıyor...");
                break;
            case GameMode.StoryMatch:
                Debug.Log("Hikaye eşleştirme oyunu başlatılıyor...");
                break;
        }
    }
    
    public void SetDifficulty(int difficulty)
    {
        currentDifficulty = Mathf.Clamp(difficulty, 1, 3);
    }
    
    public int GetDifficulty() => currentDifficulty;
}
