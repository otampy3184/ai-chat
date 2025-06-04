package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// Message represents a chat message
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest represents the request payload for chat completion
type ChatRequest struct {
	Provider string    `json:"provider"`
	Model    string    `json:"model"`
	APIKey   string    `json:"apiKey"`
	BaseURL  string    `json:"baseURL,omitempty"`
	Messages []Message `json:"messages"`
}

// ChatResponse represents the response from LLM APIs
type ChatResponse struct {
	Content string `json:"content"`
	Usage   *Usage `json:"usage,omitempty"`
}

// Usage represents token usage information
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

func main() {
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/api/chat/completions", handleChatCompletion).Methods("POST")
	r.HandleFunc("/api/health", handleHealth).Methods("GET")

	// CORS configuration
	corsObj := handlers.AllowedOrigins([]string{"http://localhost:3000", "http://localhost:3001"})
	corsHeaders := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	corsMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handlers.CORS(corsObj, corsHeaders, corsMethods)(r)))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func handleChatCompletion(w http.ResponseWriter, r *http.Request) {
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Provider == "" || req.APIKey == "" || req.Model == "" || len(req.Messages) == 0 {
		http.Error(w, "Missing required fields: provider, apiKey, model, or messages", http.StatusBadRequest)
		return
	}

	var response *ChatResponse
	var err error

	switch req.Provider {
	case "openai":
		response, err = callOpenAI(req)
	case "claude":
		response, err = callClaude(req)
	case "deepseek":
		response, err = callDeepSeek(req)
	default:
		http.Error(w, "Unsupported provider: "+req.Provider, http.StatusBadRequest)
		return
	}

	if err != nil {
		log.Printf("Error calling %s API: %v", req.Provider, err)
		http.Error(w, "Failed to call LLM API: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
