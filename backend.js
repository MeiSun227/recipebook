
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose')
require('dotenv').config()

const Recipe = require('./models/recipe')
const Author=require('./models/author')
const Ingredient = require('./models/ingredient')

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

let authors = [{
    id: "a12",
    name: 'Mei'
}]

const typeDefs = gql`

type Author{
    id:ID!
    name:String,
    postedCount:Int!    
}

type Ingredient{
    ingredientsName:[String],
    ingredientsAmount:[Int]
}

type Recipe{
    id:ID!,
    name:String,
    cookTime:Int,
    ingredients:Ingredient!,
    direction:[String],
    tags:[String],
    cuisine:String,
    published:Int
    author:String
}

type Query {
    allRecipes: [Recipe!]!
    allAuthors:[Author!]
    recipeCount:Int!
    postedCount:Int!
    cuisineCount: Int!
    findRecipe(cuisine:String,ingredientsName:String,tags:String):[Recipe!]
  }

  type Mutation {
    
    addRecipe(
        name: String!
        cookTime:Int
        ingredientsName:[String],
        ingredientsAmount:[Int],
        direction:[String],
        tags:[String],
        cuisine:String,
        published:Int
        author:String
    ) : Recipe
    deleteRecipe(
        id:ID
        ):Recipe
    editRecipe(
        name:String!
        setDirectionTo:[String]
    ):Recipe
}
`

const resolvers = {
    Query: {
        allRecipes: () => Recipe.find({}),
        postedCount: () => authors.length,
        recipeCount: () => Recipe.collection.countDocuments(),
        cuisineCount: () => { return recipes.map(recipe => recipe.cuisine).length },
        findRecipe: (root, args) => {
            if (args.cuisine && args.ingredientsName) {
                return recipes.filter(recipe => recipe.cuisine === args.cuisine && recipe.ingredientsName.includes(args.ingredientsName));
            }
            if (args.cuisine) {
                return recipes.filter(recipe => recipe.cuisine === args.cuisine);
            }
            if (args.ingredientsName) {
                console.log(args.ingredientsName)
                return recipes.filter(recipe => recipe.ingredientsName.includes(args.ingredientsName))
            }

            if (args.tags) {
                return recipes.filter(recipe => recipe.tags.includes(args.tags))
            }
            else {
                return recipes
            }
        },
        allAuthors: () => {
            return authors.map(author => {
                return {
                    ...author,
                    postedCount: recipes.filter(recipe => recipe.author === author.name).length
                }
            })
        },
    },
    Recipe: {
        ingredients: (root) => {
            return {
                ingredientsName: root.ingredientsName,
                ingredientsAmount: root.ingredientsAmount
            }
        }
    },

    Mutation: {
        addRecipe: async (root, args) => {
            const recipe = new Recipe({ ...args })
            try {
                console.log(recipe)
                await recipe.save()
                if (!Author.findOne({ name: args.name })) {
                    author = new Author({ ...args })
                    author.save()
                }
            }
            catch (error) {
                throw new Error(error.message, {
                    invalidArgs: args,
                })
            }
            return recipe
        },
        editRecipe: (root, args) => {
            const recipe = recipes.find(recipe => recipe.name === args.name)
            if (!recipe) {
                return null
            }


            const updatedRecipe = { ...recipe, direction: args.setDirectionTo }
            recipes = recipes.map(recipe => recipe.name === args.name ? updatedRecipe : recipe)
            return updatedRecipe
        },
        deleteRecipe: (root, args) => {
            const newRecipes = recipes.filter((recipe) => args.id !== recipe.id)
            recipes = newRecipes;
            console.log(recipes)
            console.log(newRecipes)
            return recipes;
        }
    }
}
const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(url)
    console.log(`Server ready at ${url}`)
})
