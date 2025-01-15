## AI element generation in Adobe Express
### Winner of best Artificial Intelligence hack at StormHacks V2 2024

This is an Adobe Express add-on that utilizes OpenAI’s function calling capabilities to dynamically generate elements. Say hi to Doug!

### Key features:

- AI assistant Doug!
  - Interprets natural language to process requests
- Uses OpenAI’s GPT platform on a Node server to process requests using function calling capabilities 
- Voice to text input via OpenAI’s Whisper API
  - Transcription is editable for further refinement and accuracy
- Context support, allowing for a user to build upon previous requests
- High potential for further customizability
  - Source code can be modified to further add more possible functions, such as specific shapes or custom templates, allowing for huge flexibility
  - Only a small amount was implemented by us as it was a hackathon project
  - Can also possibly allow for integration with other add-ons 
 
 
 ### Challenges Encountered
 - Adobe doesn’t allow external modules on the client side, preventing an easy way to make OpenAI API calls
 - Functions had to be called through the Node server, which required a different approach as the function calling capabilities could not call these functions directly 
 - Hackathons being hackathons
 - Learning new technologies 