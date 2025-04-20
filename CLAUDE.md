# Bash commands
- `npm run build`: Build the project
- `npm run dev`: Run the application

# Workflow
- At the start, run both frontend and backend in the background. Frontend is accessible at http://localhost:8080 and backend at http://localhost:3000
- IMPORTANT: At the end, run `npm run stop` to stop both services
- Every API code change, stop the backend, build it and start again
- Always review Readme file after changes. Reduce scope of the review only to the changes performed. Do that only once you've completed all your changes
- While you work on the project, create dated files such as .claude/plan_2025-04-18-0800.md containing your planned milestones, and update these documents as you progress through the task. 
- For significant pieces of completed work, update the CHANGELOG.md with a dated changelog. Please start the changelog with the input prompt then followed by each functionality introduced and reference the relevant documentation