// Speechmatics API integration for transcription
// This is a placeholder implementation that simulates API responses

const SPEECHMATICS_API_KEY = import.meta.env.SPEECHMATICS_API_KEY || '';

/**
 * Get transcript for a YouTube video using Speechmatics API
 * @param videoId YouTube video ID
 * @returns Transcript text
 */
export const getTranscript = async (videoId: string): Promise<string> => {
  // In a real implementation, we would:
  // 1. Download the audio from the YouTube video
  // 2. Send the audio to Speechmatics API for transcription
  // 3. Parse and return the transcript
  
  // For now, we simulate a delay and return placeholder data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return different placeholder transcripts based on videoId to simulate variety
      const transcripts: Record<string, string> = {
        // JavaScript Tutorial
        'DHjqpvDnNGE': `Hello everyone, welcome to this comprehensive JavaScript tutorial for beginners.

In this video, I'll teach you the fundamentals of JavaScript in a concise and easy-to-understand way.

Let's start with the basics. JavaScript is a programming language that adds interactivity to websites. It's one of the core technologies of the web, alongside HTML and CSS.

First, let's understand variables. Variables are containers for storing data values. In JavaScript, you can declare variables using var, let, or const.

var name = "John";
let age = 25;
const PI = 3.14;

The difference between var, let, and const is in their scope and reassignment capabilities.

Next, let's talk about data types. JavaScript has several data types:
- Strings: for text values
- Numbers: for numeric values
- Booleans: true or false
- Arrays: for storing multiple values in a single variable
- Objects: for storing collections of data in key-value pairs

Functions are blocks of code designed to perform particular tasks. Here's an example:

function greet(name) {
  return "Hello, " + name + "!";
}

You can call this function using: greet("John");

Conditional statements are used to perform different actions based on different conditions:

if (age >= 18) {
  console.log("You are an adult");
} else {
  console.log("You are a minor");
}

Loops are used to execute a block of code multiple times:

for (let i = 0; i < 5; i++) {
  console.log(i);
}

Events are actions that happen in the browser that JavaScript can respond to:

document.getElementById("button").addEventListener("click", function() {
  alert("Button clicked!");
});

And finally, DOM manipulation allows you to change HTML elements on your page:

document.getElementById("demo").innerHTML = "Hello JavaScript!";

That covers the basics of JavaScript! Remember to practice these concepts by building small projects.`,

        // Learn HTML in 12 Minutes
        'rJesac0_Ftw': `Welcome to this crash course on HTML. In the next 12 minutes, I'll teach you the fundamentals of HTML, which stands for HyperText Markup Language.

HTML is the standard markup language for creating web pages. It describes the structure of a web page using elements represented by tags.

Let's start with the basic structure of an HTML document:

<!DOCTYPE html>
<html>
<head>
  <title>Page Title</title>
</head>
<body>
  <h1>My First Heading</h1>
  <p>My first paragraph.</p>
</body>
</html>

The <!DOCTYPE html> declaration defines the document type and version of HTML.
The <html> element is the root element of an HTML page.
The <head> element contains meta information about the document.
The <title> element specifies a title for the document.
The <body> element contains the visible page content.

HTML elements are defined by tags. Tags are usually in pairs with an opening and closing tag:
<tagname>Content goes here...</tagname>

Some common HTML elements include:

Headings: <h1> to <h6>
Paragraphs: <p>
Links: <a href="url">link text</a>
Images: <img src="image.jpg" alt="description">
Lists:
- Unordered lists: <ul> with <li> items
- Ordered lists: <ol> with <li> items

Tables:
<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
  </tr>
  <tr>
    <td>Data 1</td>
    <td>Data 2</td>
  </tr>
</table>

Forms:
<form>
  <input type="text" name="name">
  <input type="submit" value="Submit">
</form>

HTML attributes provide additional information about an element:
<a href="https://www.example.com">Visit Example.com</a>

The href attribute specifies the URL of the page the link goes to.

Remember, HTML is about structure, CSS is about style, and JavaScript is about behavior.

This is a very quick overview, but it covers the basics you need to start creating simple web pages.`,

        // CSS Variables in 100 Seconds
        'Zftx68K-1D4': `Today, I'm going to explain CSS Variables, also known as CSS Custom Properties, in under 100 seconds.

CSS Variables allow you to define reusable values in your stylesheets. They're incredibly useful for maintaining consistent styling across your website and making global changes easier.

To declare a CSS variable, you use the double-dash prefix followed by the variable name:

:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size: 16px;
  --spacing: 1.5rem;
}

The :root selector defines global variables that can be used throughout your document.

To use these variables in your CSS rules, you use the var() function:

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size);
  padding: var(--spacing);
}

.header {
  color: var(--secondary-color);
  margin-bottom: var(--spacing);
}

One of the biggest advantages of CSS variables is that they can be updated dynamically with JavaScript:

document.documentElement.style.setProperty('--primary-color', '#ff0000');

This would change the primary color to red across your entire site instantly.

CSS Variables also have scope. Variables defined on specific elements are only available within that element and its children:

.dark-theme {
  --text-color: white;
  --bg-color: black;
}

Variables also cascade and can be overridden in more specific selectors, just like regular CSS properties.

That's CSS Variables in a nutshell - a powerful feature for creating more maintainable stylesheets.`,

        // Learn Git Branching in 4 Minutes
        '6G8kKcRSH0E': `In this quick tutorial, I'll teach you the basics of Git branching in just four minutes.

Git branching is one of the most powerful features of Git. It allows you to diverge from the main line of development and work on different features or fixes without affecting the main codebase.

First, let's understand what a branch is. A branch in Git is simply a lightweight movable pointer to a commit. The default branch in Git is called 'master' or 'main'.

To create a new branch, you use the command:
git branch feature-branch

This creates a new branch but doesn't switch to it. To create and switch to a new branch in one command, use:
git checkout -b feature-branch

Now you're on the feature branch. Any commits you make will be added to this branch without affecting the main branch.

To see all branches in your repository:
git branch

The branch with an asterisk (*) is the one you're currently on.

To switch between branches:
git checkout main
git checkout feature-branch

Once you've made changes on your feature branch and committed them, you might want to merge these changes back into the main branch:

git checkout main
git merge feature-branch

This brings all the changes from your feature branch into the main branch.

Sometimes, merges can lead to conflicts if the same part of a file was changed in both branches. Git will mark these conflicts, and you'll need to resolve them manually.

After merging, you may want to delete the feature branch if it's no longer needed:
git branch -d feature-branch

For collaborative workflows, you'll often push your branches to a remote repository:
git push origin feature-branch

And when you want to get a branch from the remote:
git fetch origin
git checkout feature-branch

That covers the basics of Git branching! It's a powerful tool that enables efficient collaborative development.`,

        // Default transcript for any other video ID
        'default': `In this tutorial, we'll be covering the basics of web development.

First, I'll introduce HTML, which is the structure of web pages.
Then, we'll look at CSS, which is used for styling.
Finally, we'll explore JavaScript, which adds interactivity to websites.

HTML elements are the building blocks of web pages. They define the structure and content of your page.
Basic HTML elements include headings, paragraphs, links, images, and lists.

CSS (Cascading Style Sheets) is used to style your HTML elements.
You can change colors, fonts, spacing, layouts, and more with CSS.
CSS can be applied inline, internally, or via external stylesheets.

JavaScript is a programming language that adds behavior to your web pages.
With JavaScript, you can create interactive elements, validate forms, and dynamically update content.
Modern web development relies heavily on JavaScript frameworks and libraries.

Responsive design ensures your website looks good on all devices.
This is achieved through media queries and flexible layouts in CSS.
Mobile-first design is now the standard approach for most websites.

Web accessibility is important to ensure everyone can use your website.
This includes proper semantic HTML, color contrast, keyboard navigation, and more.

Performance optimization helps your website load quickly.
Techniques include image optimization, code minification, and caching.

Remember to practice what you learn by building small projects.
Let's dive in and start coding!`,
      };
      
      resolve(transcripts[videoId] || transcripts.default);
    }, 1500); // Simulate a network delay
  });
};

/**
 * Check if Speechmatics API is configured and available
 * @returns Boolean indicating if the API is ready
 */
export const isSpeechmaticsConfigured = (): boolean => {
  return Boolean(SPEECHMATICS_API_KEY);
}; 