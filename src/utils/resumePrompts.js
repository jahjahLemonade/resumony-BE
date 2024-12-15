export const getResumeSystemPrompt = () => {
  return "You are a professional resume writer skilled in tailoring resumes to match specific job requirements. Your task is to create a customized resume that highlights the candidate's strengths and aligns them with the job responsibilities and qualifications"
}

export const getResumeUserPrompt = ({
  careerSummary,
  companyName,
  workExperience,
  role,
  responsibilities,
  skills,
  qualifications,
}) => {
  return `Based on the following user information, job details, and qualifications, rewrite the resume content to make it more aligned with the job description, role requirements, and qualifications. 

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
- Career Summary: ${careerSummary}
- Work Experience: ${workExperience}
- Skills: ${skills}

### Job Information:
- Company Name: ${companyName}
- Role: ${role}
- Responsibilities: ${responsibilities}

### Job Qualifications:
${qualifications}

### Output:
Use appropriate HTML tags such as <h2> for section headings, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis where needed. Provide only the raw HTML structure. Do not use \`\`\`html or any code block formatting.`
}

// export const getResumeUserPrompt = ({
//   careerSummary,
//   companyName,
//   workExperience,
//   role,
//   responsibilities,
//   skills,
//   qualifications,
// }) => {
//   return `Based on the following user information, job details, and qualifications, rewrite the resume content to make it more aligned with the job description, role requirements and qualifications.
// The output should include the following sections:
// - Summary
// - Work Experience
// - Job Title
// - Company
// - Location
// - Duration
// - Responsibilities

// ### Requirements:
// 1. Rewrite the resume summary to incorporate relevant keywords from the job description and qualifications, while keeping it concise and under 500 characters.
// 2. Use only the information found in the user's original resume to rewrite the work experience section, tailoring it specifically for the role.
// 3. Ensure that the proper resume headers are maintained, using the job title and company name as headers for the outputted work experience information.
// 4. Do not directly copy the user's existing content; instead, rephrase and restructure it to better match the job description, qualifications, and role requirements.

//           ### User Information:
//           - Career Summary: ${careerSummary}.
//           - Work Experience: ${workExperience}

//           - Skills: ${skills}

//           ### Job Information:
//           - Company Name: ${companyName}
//           - Role: ${role}
//           - Responsibilities: ${responsibilities}

// ### Job Qualifications:

// ${qualifications}

//           ### Output:
//           \n\nUse appropriate HTML tags such as <h2> for section headings, <p> for paragraphs, <ul> and <li> for lists, and <strong> for emphasis where needed.\nProvide only the raw HTML structure.\n\nDo not \`\`\`html or any code block formatting`
// }
