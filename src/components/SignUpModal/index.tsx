import "./styles.css";

import { useAuth } from '@/providers/AuthProvider/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const SignUpModal = ({ disabled }: { disabled: boolean }) => {
  const { signInWithOAuth } = useAuth();

  return (
    <div className={`${disabled ? "board-overlay" : "hidden"}`}>
      <Card className='w-[32rem]'>
        <CardHeader className='items-start'>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>In order to continue please sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-lg'>Chesski requires account details to personalize the experience</p>
        </CardContent>
        <CardFooter className='justify-center'>
          <Button onClick={signInWithOAuth}>
            Sign in with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};


