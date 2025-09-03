# **Kaggle Pilot \- Your Integrated Kaggle Co-pilot for VS Code**

**Kaggle Pilot** brings the entire Kaggle ecosystem directly into your Visual Studio Code editor. Stop switching between your browser and your IDE. Manage competitions, discover datasets, and run a complete notebook development workflow without ever leaving your development environment.

This extension is designed to streamline your data science process, providing a seamless bridge between the rich, personalized experience of your local machine and Kaggle's powerful cloud infrastructure.

## **✨ Features**

kagglepilot provides a comprehensive suite of tools, all accessible from a dedicated sidebar view in VS Code.

### **General**

* **Secure Authentication**: A simple command (Kaggle: Set API Credentials) to securely set up your Kaggle API token.  
* **Dedicated Sidebar**: A central hub for all your Kaggle activities, with organized views for Competitions, your Notebooks, and Datasets.

### **Full Notebook Workflow**

This is the core of the extension, providing an end-to-end development cycle for your Kaggle notebooks.

* **Initialize New Notebook**: Create a new, ready-to-push notebook from scratch with a single click on the "new file" icon.  
* **Pull & Push**: Seamlessly download notebooks into organized folders and upload your local changes back to Kaggle.  
* **Pre-flight Push Check**: An intelligent, interactive prompt guides you through confirming **GPU**, **internet**, and **dataset** settings before every upload to prevent mistakes.  
* **Watch Notebook Runs**: Automatically monitor a notebook's run status in real-time in the VS Code output channel, with notifications on completion.  
* **Get Output**: Easily download all output files (like .csv or model files) from a completed notebook run.

### **Competition Management**

* **Browse Competitions**: View a list of active competitions.  
* **Download Data**: Right-click any competition to download its dataset directly into your workspace.

### **Dataset Management**

* **Browse & Search**: View popular datasets or use the search command (Kaggle: Search Datasets...) to find any dataset in Kaggle's library.  
* **Download Datasets**: Right-click any dataset to download and automatically unzip it into your workspace.

## **🚀 Getting Started**

Follow these simple steps to get kagglepilot up and running.

### **Prerequisites**

1. **Visual Studio Code**: Version 1.75 or higher.  
2. **Python**: You must have Python installed and available on your system's PATH.  
3. **Kaggle CLI**: The extension is powered by the official Kaggle CLI. Install it via pip:  
   pip install \--upgrade kaggle

4. **Kaggle API Token**:  
   * Go to your Kaggle account page: https://www.kaggle.com/account.  
   * Click the "Create New API Token" button. This will download a kaggle.json file. Keep it handy.

### **Installation & Setup**

1. Install the **Kaggle Pilot** extension from the VS Code Marketplace.  
2. Once installed, open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P).  
3. Run the command **Kaggle: Set API Credentials**.  
4. When prompted, select the kaggle.json file you downloaded.

You are now ready to use all the features of Kaggle Pilot\! Click the Kaggle logo in the Activity Bar to get started.

## **📖 Usage Guide**

All features are accessible from the **Kaggle icon** in the VS Code Activity Bar.

### **Working with Notebooks**

* **To create a new notebook**: Click the "new file" icon in the "My Notebooks" view header and follow the prompts.  
* **To pull a notebook**: Right-click a notebook in the sidebar and select "Pull Notebook to Workspace". It will be downloaded into its own dedicated folder.  
* **To push a notebook**: After making changes, right-click the notebook's .ipynb file tab and select "Push Notebook to Kaggle...". Follow the pre-flight check prompts to confirm your settings.  
* **To monitor a run**: Right-click a notebook in the sidebar and select "Watch Notebook Run".

### **Working with Datasets**

* **To search for datasets**: Open the Command Palette (Ctrl+Shift+P) and run **Kaggle: Search Datasets...**. The sidebar will update with the results.  
* **To download a dataset**: Right-click a dataset in the sidebar and select "Download Dataset".

## **📜 License**

This project is licensed under the MIT License \- see the LICENSE file for details.