using System.Collections.Generic;
using UnityEngine;

public class MultipleChoiceGame : MonoBehaviour
{
    private Proverb currentProverb;
    private List<string> options = new List<string>();
    
    public void StartRound()
    {
        currentProverb = ProverbData.Instance.GetRandomProverb();
        if (currentProverb == null) return;
        
        // Seçenekleri hazırla
        options.Clear();
        options.Add(currentProverb.text); // Doğru cevap
        options.AddRange(currentProverb.wrongAnswers); // Yanlış cevaplar
        
        // Karıştır
        ShuffleOptions();
        
        DisplayQuestion();
    }
    
    void ShuffleOptions()
    {
        for (int i = 0; i < options.Count; i++)
        {
            string temp = options[i];
            int randomIndex = Random.Range(i, options.Count);
            options[i] = options[randomIndex];
            options[randomIndex] = temp;
        }
    }
    
    void DisplayQuestion()
    {
        Debug.Log($"Soru: {currentProverb.meaning}");
        Debug.Log("Seçenekler:");
        for (int i = 0; i < options.Count; i++)
        {
            Debug.Log($"{i + 1}. {options[i]}");
        }
    }
    
    public bool CheckAnswer(string selectedAnswer)
    {
        bool isCorrect = selectedAnswer == currentProverb.text;
        
        if (isCorrect)
        {
            GameManager.Instance.AddScore(10);
            Debug.Log("Doğru! +10 puan");
        }
        else
        {
            GameManager.Instance.ResetConsecutive();
            Debug.Log($"Yanlış! Doğru cevap: {currentProverb.text}");
        }
        
        return isCorrect;
    }
}
