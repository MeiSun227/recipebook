const { ApolloServer, gql } = require('apollo-server');
const { v1: uuid } = require('uuid');

let authors = [{
    id: "a12",
    name: 'Mei'
}]


let recipes = [{
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
    name: 'Garlic shrimp pasta',
    cookTime: 20,
    ingredients: ['shrimps', 'pasta', 'garlic', 'butter'],
    direction: ['sdsadasdasdasdasdas', 'sdsdasdasdas'],
    tags: ['simple', 'fast prepare'],
    author: 'Mei',
    cuisine: 'Italian',
    published: 2019
}]




const typeDefs = gql`

type Author{
    id:ID!
    name:String,
    postedCount:Int!    
}

type Recipe{
    id:ID!,
    name:String,
    cookTime:Int,
    ingredients:[String],
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
    findRecipe(cuisine:String,ingredients:String,tags:String):[Recipe!]
  }

  type Mutation {
    addRecipe(
        name: String!
        cookTime:Int
        ingredients:[String],
        direction:[String],
        tags:[String],
        cuisine:String,
        published:Int
        author:String
    ) : Recipe
    editRecipe(
        name:String!
        setDirectionTo:[String]
    ):Recipe
}
`

const resolvers = {
    Query: {
        postedCount: () => authors.length,
        recipeCount: () => recipes.length,
        cuisineCount: () => { return recipes.map(recipe => recipe.cuisine).length },
        findRecipe: (root, args) => {
            if (args.cuisine && args.ingredients) {
                return recipes.filter(recipe => recipe.cuisine === args.cuisine && recipe.ingredients.includes(args.ingredients));
            }
            if (args.cuisine) {
                return recipes.filter(recipe => recipe.cuisine === args.cuisine);
            }
            if (args.ingredients) {
                console.log(args.ingredients)
                return recipes.filter(recipe => recipe.ingredients.includes(args.ingredients))
            }

            if (args.tags) {
                return recipes.filter(recipe => recipe.tags.includes(args.tags))
            }
            else {
                return recipes
            }
        },
        allRecipes: () => recipes,
        allAuthors: () => {
            return authors.map(author => {
                return {
                    ...author,
                    postedCount: recipes.filter(recipe => recipe.author === author.name).length
                }
            })
        }
    },
    Mutation: {
        addRecipe: (root, args) => {
            const recipe = { ...args, id: uuid() }
            recipes = recipes.concat(recipe)
            if (!authors.find(author => author.name === args.name)) {
                authors = authors.concat({ name: args.author, id: uuid() })
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
        }
    }
}
const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
