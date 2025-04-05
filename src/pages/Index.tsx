
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="main-container min-h-screen flex flex-col">
      <header className="py-12 md:py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-4 px-4">
          <h1 className="title-gradient text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Split Bills Effortlessly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Smart bill splitting that takes the hassle out of group payments
          </p>
          <div className="py-6">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/create">Create New Bill</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <section className="section bg-secondary/50 py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Split bills fairly in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">1</div>
                <CardTitle>Create a Bill</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enter bill details manually or upload a picture for automatic parsing. Edit items as needed.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">2</div>
                <CardTitle>Share with Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Add participants and send them a unique link to select what they ordered from the bill.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 text-xl font-bold">3</div>
                <CardTitle>Split Automatically</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our smart algorithm calculates exactly what each person owes, including tax and service charges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="section py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">Fair Splitting, Every Time</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Split proportionally</h3>
                  <p className="text-muted-foreground">
                    Taxes and service charges are split based on what each person ordered, not equally.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Real-time calculations</h3>
                  <p className="text-muted-foreground">
                    See who owes what as selections are made by each participant.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Time-limited sessions</h3>
                  <p className="text-muted-foreground">
                    Set a time limit for item selection to keep everyone on track.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link to="/create">Get Started</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-6 rounded-lg">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle>Sample Bill Breakdown</CardTitle>
                  <CardDescription>Example of how items are split</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Person</div>
                      <div className="text-sm font-medium">Amount Due</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>Aisha</div>
                      <div>₹425.50</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>Raj</div>
                      <div>₹310.25</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>Priya</div>
                      <div>₹625.00</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="font-medium">Total</div>
                      <div className="font-medium">₹1360.75</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="py-8 border-t">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Smart Bill Splitter | Made with ♡ for easier splitting
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
