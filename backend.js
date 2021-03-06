
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose')
require('dotenv').config()

const Recipe = require('./models/recipe')
const Author = require('./models/author')
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
        allRecipes: async () => {
            const recipes = await Recipe.find({})
            return recipes
        },
        recipeCount: () => Recipe.collection.countDocuments(),

        findRecipe: async (root, args) => {
            let recipes= await Recipe.find({})
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
        allAuthors: async () => {
            const authors = await Author.find({}).populate('recipe')
            console.log(authors)
            return authors.map(author => {
                return {
                    name: author.name,
                    id: author.id,
                    postedCount: author.recipes.length

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
            let author = await Author.findOne({ name: args.author });
            try {
                if (!author) {
                    author = new Author({ name: args.author })
                }
                author.recipes = author.recipes.concat(recipe.id)
                await author.save()
                await recipe.save()
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
