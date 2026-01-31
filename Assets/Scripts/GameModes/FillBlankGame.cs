using System.Collections.Generic;
using UnityEngine;

public class FillBlankGame : MonoBehaviour
{
    private Proverb currentProverb;
    private string missingWord;
    private string displayText;
    private List<string> wordOptions = new List<string>();
    
    public void StartRound()
    {
        currentProverb = ProverbData.Instance.GetRandomProverb();
        if (currentProverb == null) return;
        
        CreateBlankQuestion();
        DisplayQuestion();
    }
    
    void CreateBlankQuestion()
    {
        string[] words = currentProverb.text.Split(' ');
        
        // Rastgele bir kelimeyi seç (ilk ve son kelime hariç)
        int randomIndex = Random.Range(1, words.Length - 1);
        missingWord = words[randomIndex];
        
        // Boşluk bırak
        words[randomIndex] = "____";
        displayText = string.Join(" ", words);
        
        // Seçenekleri hazırla
        wordOptions.Clear();
        wordOptions.Add(missingWord); // Doğru cevap
        
        // Yanlış seçenekler ekle (diğer atasözlerinden kelimeler)
        AddWrongWordOptions();
        
        // Karıştır
        ShuffleOptions();
    }
    
    void AddWrongWordOptions()
    {
        // Basit örnek: rastgele kelimeler ekle
        string[] wrongWords = { "gider", "gelir", "olur", "yapar", "eder", "tutar" };
        
        while (wordOptions.Count < 4)
        {
            string word = wrongWords[Random.Range(0, wrongWords.Length)];
            if (!wordOptions.Contains(word) && word != missingWord)
            {
                wordOptions.Add(word);
            }
        }
    }
    
    void ShuffleOptions()
    {
        for (int i = 0; i < wordOptions.Count; i++)
        {
            string temp = wordOptions[i];
            int randomIndex = Random.Range(i, wordOptions.Count);
            wordOptions[i] = wordOptions[randomIndex];
            wordOptions[randomIndex] = temp;
        }
    }
    
    void DisplayQuestion()
    {
        Debug.Log($"Atasözünü tamamla: {displayText}");
        Debug.Log("Seçenekler:");
        for (int i = 0; i < wordOptions.Count; i++)
        {
            Debug.Log($"{i + 1}. {wordOptions[i]}");
        }
    }
    
    public bool CheckAnswer(string selectedWord)
    {
        bool isCorrect = selectedWord == missingWord;
        
        if (isCorrect)
        {
            GameManager.Instance.AddScore(15);
            Debug.Log($"Doğru! Tam atasözü: {currentProverb.text}");
        }
        else
        {
            GameManager.Instance.ResetConsecutive();
            Debug.Log($"Yanlış! Doğru kelime: {missingWord}");
        }
        
        return isCorrect;
    }
}
