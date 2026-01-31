using System.Collections.Generic;
using UnityEngine;

public class MatchingGame : MonoBehaviour
{
    private List<Proverb> currentProverbs = new List<Proverb>();
    private Dictionary<int, int> matches = new Dictionary<int, int>();
    
    public void StartRound(int pairCount = 4)
    {
        currentProverbs.Clear();
        matches.Clear();
        
        // Rastgele atasözleri seç
        List<Proverb> allProverbs = ProverbData.Instance.GetProverbsByDifficulty(1);
        
        for (int i = 0; i < pairCount && i < allProverbs.Count; i++)
        {
            int randomIndex = Random.Range(0, allProverbs.Count);
            currentProverbs.Add(allProverbs[randomIndex]);
            allProverbs.RemoveAt(randomIndex);
        }
        
        DisplayMatchingPairs();
    }
    
    void DisplayMatchingPairs()
    {
        Debug.Log("=== EŞLEŞTIRME OYUNU ===");
        Debug.Log("\nATASÖZLERİ:");
        for (int i = 0; i < currentProverbs.Count; i++)
        {
            Debug.Log($"{i + 1}. {currentProverbs[i].text}");
        }
        
        Debug.Log("\nANLAMLAR:");
        List<string> meanings = new List<string>();
        foreach (var proverb in currentProverbs)
        {
            meanings.Add(proverb.meaning);
        }
        
        // Anlamları karıştır
        for (int i = 0; i < meanings.Count; i++)
        {
            string temp = meanings[i];
            int randomIndex = Random.Range(i, meanings.Count);
            meanings[i] = meanings[randomIndex];
            meanings[randomIndex] = temp;
        }
        
        for (int i = 0; i < meanings.Count; i++)
        {
            Debug.Log($"{(char)('A' + i)}. {meanings[i]}");
        }
    }
    
    public bool CheckMatch(int proverbIndex, string meaning)
    {
        if (proverbIndex < 0 || proverbIndex >= currentProverbs.Count)
            return false;
        
        bool isCorrect = currentProverbs[proverbIndex].meaning == meaning;
        
        if (isCorrect)
        {
            matches[proverbIndex] = 1;
            GameManager.Instance.AddScore(20);
            Debug.Log("Doğru eşleştirme! +20 puan");
            
            if (matches.Count == currentProverbs.Count)
            {
                Debug.Log("Tüm eşleştirmeler tamamlandı!");
            }
        }
        else
        {
            GameManager.Instance.ResetConsecutive();
            Debug.Log("Yanlış eşleştirme!");
        }
        
        return isCorrect;
    }
}
