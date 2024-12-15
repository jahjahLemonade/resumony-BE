const getResumeSystemPrompt = () => {
  return "You are a professional resume writer skilled in tailoring resumes to match specific job requirements. Your task is to create a customized resume that highlights the candidate's strengths and aligns them with the job responsibilities and qualifications"
}

const getResumeUserPrompt = () => {
  return `Based on the following user information, job details, and qualifications, rewrite the resume content to make it more aligned with the job description, role requirements and qualifications. 
The output should include the following sections:
- Summary
- Work Experience
- Job Title
- Company
- Location
- Duration
- Responsibilities

### Requirements:
1. Rewrite the resume summary to incorporate relevant keywords from the job description and qualifications, while keeping it concise and under 500 characters.
2. Use only the information found in the user's original resume to rewrite the work experience section, tailoring it specifically for the role.
3. Ensure that the proper resume headers are maintained, using the job title and company name as headers for the outputted work experience information.
4. Do not directly copy the user's existing content; instead, rephrase and restructure it to better match the job description, qualifications, and role requirements.

          ### User Information:
          - Career Summary: A highly skilled and motivated software developer with experience in backend development and a passion for growing skills in full-stack development. Proficient in various programming languages like JavaScript, Go, and Python, and frameworks like React and Node.js, with experience working with Kubernetes. 
          - Work Experience: IBM, Software Engineer — Austin, TX (01/2021 – Present):
● Managed Golang-based microservices on Kubernetes for real-time VPC capacity monitoring in IBM Cloud, delivering analytics via a REST API on a 5-second time scale.
● Automated cloud customer notifications during VM maintenance for my team using Jenkins, our internal API, and Python. This improvement enhanced client communication with customers across 60 data centers in 10+ countries.
● Utilized Grafana to migrate virtual machine and power metrics from the NextGen Monitoring Console (Zabbix), facilitating effective data visualization for informed decision-making and VPC capacity monitoring across different teams within IBM.
● Migrated metrics within the Sysdig environment by leveraging Go, Prometheus, and Sysdig in tandem. This enhanced monitoring and analysis capabilities while proactively managing capacity through custom Slack alerts.
● Led an internal hackathon development team in creating a real-time communication web application with React, Node.js, and Socket.io. This project aimed to address how people can stay connected during the pandemic, allowing me to refine my leadership and project management skills.
● Developed a memory stress test, improving system reliability during live migrations and establishing performance benchmarks.
● Actively participated, along with 10,000 IBMers in an internal challenge aimed at stress-testing and gaining firsthand experience with IBM's suite of AI products released under Watson X.

          - Skills: ● Proficient: Sql, React, Aws, Typescript, Nodejs
● Knowledgeable: Git, SQL, Tailwind, Jenkins, Postgres, Socket.io, Docker, Kubernetes, Firebase, Prometheus, Grafana, Java, Graphql
● Familiar:  Java, C++, Linux


          ### Job Information:
          - Company Name: Archive
          - Role: Backend engineer
          - Responsibilities: 

- This role offers the challenge of building highly scalable backend services that unlock deep insights for our customers about the full lifecycle of their goods. Help us build out the resale intelligence layer of our platform to keep these goods in use for longer


- Design and implement services for our platform that include tools to identify and prepare items for resale, fulfill and support customer orders, handling everything from graphQL action handlers to 3rd party integrations

- Expand and grow our resale intelligence capability to turn rich data into actionable intelligence and optimize profitability of our clients

- Work closely with our brand success teams and logistics partners to deliver core Archive product features that power resale operations

- Provide data and analytical support for brand success initiatives

### Job Qualifications:

- Strong proficiency in backend programming languages such as Go, Python, Java, or Node.js.
- Experience designing and implementing RESTful APIs and microservices architecture.
- Proficiency in database technologies (e.g., PostgreSQL, MySQL, MongoDB) and query optimization.
- Solid understanding of containerization and orchestration tools (e.g., Docker, Kubernetes).
- Experience with cloud platforms such as AWS, GCP, or Azure for deploying and managing services.
- Familiarity with CI/CD pipelines, automated testing, and version control (Git).


          ### Output:
          Please provide the resume in JSON format`
}
