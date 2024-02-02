import ReactMarkdown from "react-markdown";
import "./styles.css";

export default function Privacy() {
  
  return (
    <ReactMarkdown 
      className={"doc"} 
      components={
        {
          h1: ({node, ...props}) => <h1 style={{
            color: '#333', // Dark gray
            borderBottom: '2px solid #eaecef', // Light gray border
            paddingBottom: '0.3rem',
            marginBottom: '1rem',
            marginTop: '1rem',
            fontWeight: 'bold', // Make header bold
            fontSize: '2em', // Larger font size for h1
          }} {...props} />,
          h2: ({node, ...props}) => <h2 style={{
            color: '#586069', // Medium gray
            borderBottom: '1px solid #eaecef', // Light gray border
            paddingBottom: '0.2rem',
            marginBottom: '1rem',
            marginTop: '1rem',
            fontWeight: 'bold', // Make header bold
            fontSize: '1.5em', // Medium font size for h2
          }} {...props} />,
          h3: ({node, ...props}) => <h3 style={{
            color: '#24292e', // Nearly black
            marginBottom: '1rem',
            marginTop: '1rem',
            fontWeight: 'bold', // Make header bold
      fontSize: '1.17em', // Smaller font size for h3
          }} {...props} />,
          ul: ({node, ...props}) => <ul style={{listStyleType: 'circle'}} {...props} />,
          // Custom renderer for ordered lists
          ol: ({node, ...props}) => <ol style={{listStyleType: 'decimal'}} {...props} />,
          // Custom renderer for list items
          li: ({node, ...props}) => <li style={{marginBottom: '0.5rem'}} {...props} />,
        }
      }>
      {`# Chesski Privacy Policy
Last updated: February 2, 2024

At Chesski, accessible from [https://chesski.lol](https://chesski.lol/), one of our main priorities is the privacy of our users. This Privacy Policy document contains types of information that are collected and recorded by Chesski and how we use it.

If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.

This Privacy Policy applies only to our online activities and is valid for visitors to our app with regards to the information that they shared and/or collect in Chesski. This policy is not applicable to any information collected offline or via channels other than this app.

## Consent

By using our app, you hereby consent to our Privacy Policy and agree to its terms.

## Information we collect

The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.

If you choose to use our app, we may require you to provide us with certain personally identifiable information, including but not limited to:

- Name
- Email address
- Chess gameplay data and history
- AI coaching session data

This information is used to provide you with a personalized chess coaching experience and to improve our app's functionality.

## How we use your information

We use the information we collect in various ways, including to:

- Provide, operate, and maintain our app
- Improve, personalize, and expand our app
- Understand and analyze how you use our app
- Develop new products, services, features, and functionality
- Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the app, and for marketing and promotional purposes
- Send you emails
- Find and prevent fraud`}
    </ReactMarkdown>
  )
}